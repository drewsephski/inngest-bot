import { NextResponse } from 'next/server';

import { checkDbHealth } from '@/lib/db';

/**
 * Health check endpoint for monitoring and load balancers
 * Returns status of all critical services
 */

interface HealthStatus {
	database: {
		healthy: boolean;
		latency: number;
	};
	status: 'healthy' | 'degraded' | 'unhealthy';
	timestamp: string;
	uptime: number;
	version: string;
}

// Track server start time for uptime
const START_TIME = Date.now();

export async function GET() {
	const checks = await Promise.all([checkDbHealth()]);

	const [dbHealth] = checks;

	// Determine overall status
	let status: HealthStatus['status'] = 'healthy';
	if (!dbHealth.healthy) {
		status = 'unhealthy';
	} else if (dbHealth.latency > 1000) {
		status = 'degraded';
	}

	const health: HealthStatus = {
		database: {
			healthy: dbHealth.healthy,
			latency: Math.round(dbHealth.latency),
		},
		status,
		timestamp: new Date().toISOString(),
		uptime: Date.now() - START_TIME,
		version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
	};

	// Return appropriate status code
	const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

	return NextResponse.json(health, {
		headers: {
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			Pragma: 'no-cache',
		},
		status: statusCode,
	});
}

/**
 * Simple liveness probe - always returns 200 if server is running
 */
export async function HEAD() {
	return new NextResponse(null, { status: 200 });
}
