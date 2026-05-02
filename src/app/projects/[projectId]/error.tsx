'use client';

import { useEffect } from 'react';

import { RouteError } from '@/components/route-error';

/**
 * Error boundary for project pages
 * Catches and displays errors that occur during project data fetching or rendering
 */
export default function ProjectError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log error to monitoring service (e.g., Sentry)
		console.error('[Project Error Boundary]', error);
	}, [error]);

	return (
		<RouteError
			description={error.message || 'Failed to load the project. It may have been deleted or you may not have access.'}
			homeHref='/'
			onRetry={reset}
			showBack
			showRetry
			title='Failed to load project'
		/>
	);
}
