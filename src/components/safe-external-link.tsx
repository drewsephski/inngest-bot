'use client';

import { ALLOWED_EXTERNAL_DOMAINS } from '@/config';
import { cn, validateExternalUrl } from '@/lib/utils';

interface SafeExternalLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	title?: string;
}

/**
 * Safe external link component that validates URLs before rendering
 * Prevents open redirect vulnerabilities by checking against allowed domains
 */
export const SafeExternalLink = ({
	href,
	children,
	className,
	title,
}: SafeExternalLinkProps) => {
	// Validate the URL against allowed domains
	const validatedUrl = validateExternalUrl(href, [...ALLOWED_EXTERNAL_DOMAINS]);

	// If URL is invalid, don't render the link (fail secure)
	if (!validatedUrl) {
		console.warn(`[SafeExternalLink] Blocked invalid URL: ${href}`);
		return null;
	}

	return (
		<a
			href={validatedUrl}
			target='_blank'
			rel='noopener noreferrer'
			title={title || `Opens ${validatedUrl} in new tab`}
			className={cn(className)}
		>
			{children}
		</a>
	);
};
