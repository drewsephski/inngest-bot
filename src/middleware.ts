import { NextResponse, type NextRequest } from 'next/server';

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define route access patterns
const PROTECTED_ROUTES = ['/projects/:path*', '/settings', '/api/inngest'];
const ADMIN_ROUTES: string[] = [];

// Rate limiting map (simple in-memory, for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute for public routes

/**
 * Simple rate limiting middleware
 */
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}

	record.count++;
	return true;
}

/**
 * Clean up expired rate limit entries periodically
 */
function cleanupRateLimitMap() {
	const now = Date.now();
	for (const [ip, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(ip);
		}
	}
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

// Create route matchers
const isProtectedRoute = createRouteMatcher(PROTECTED_ROUTES);

/**
 * Check if user has admin role
 */
function isAdmin(metadata: Record<string, unknown> | undefined): boolean {
	return metadata?.role === 'admin';
}

/**
 * Check if a route is admin-only
 */
function isAdminRoute(pathname: string): boolean {
	return ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
	// Prevent clickjacking
	response.headers.set('X-Frame-Options', 'DENY');

	// Prevent MIME type sniffing
	response.headers.set('X-Content-Type-Options', 'nosniff');

	// Referrer policy
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// XSS protection
	response.headers.set('X-XSS-Protection', '1; mode=block');

	// Content Security Policy (adjust as needed)
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accounts.dev https://*.clerk.dev; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self' https://*.clerk.dev https://api.openrouter.ai https://api.github.com; frame-src 'self' https://*.clerk.dev;"
	);
}

/**
 * Main middleware function with comprehensive protection
 */
export default clerkMiddleware(async (auth, req: NextRequest) => {
	const pathname = req.nextUrl.pathname;

	// Rate limiting for API routes
	if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
		const forwardedFor = req.headers.get('x-forwarded-for');
		const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

		if (!checkRateLimit(ip)) {
			return NextResponse.json(
				{ error: 'Rate limit exceeded. Please try again later.' },
				{ headers: { 'Retry-After': '60' }, status: 429 }
			);
		}
	}

	// If user is not signed in and trying to access protected route
	if (isProtectedRoute(req)) {
		await auth.protect();
	}

	// Check admin routes
	const { sessionClaims } = await auth();
	if (isAdminRoute(pathname) && !isAdmin(sessionClaims?.metadata as Record<string, unknown> | undefined)) {
		return NextResponse.redirect(new URL('/', req.url));
	}

	// Add security headers to all responses
	const response = NextResponse.next();
	addSecurityHeaders(response);

	return response;
});

/**
 * Configure middleware matcher
 * Excludes static files and Next.js internals
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files (robots.txt, sitemap.xml, etc.)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$).*)',
	],
};
