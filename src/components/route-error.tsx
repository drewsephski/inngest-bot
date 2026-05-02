'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AlertCircleIcon, ArrowLeftIcon, HomeIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface RouteErrorProps {
	/**
	 * Error title to display
	 */
	title?: string;
	/**
	 * Error description/message
	 */
	description?: string;
	/**
	 * Whether to show the retry button
	 */
	showRetry?: boolean;
	/**
	 * Callback when retry button is clicked
	 */
	onRetry?: () => void;
	/**
	 * Whether to show the back button
	 */
	showBack?: boolean;
	/**
	 * Custom href for the home button
	 */
	homeHref?: string;
}

/**
 * Standardized route error component for consistent error handling
 * across all application routes.
 */
export const RouteError = ({
	title = 'Something went wrong',
	description = 'An unexpected error occurred. Please try again.',
	showRetry = false,
	onRetry,
	showBack = true,
	homeHref = '/',
}: RouteErrorProps) => {
	const router = useRouter();

	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
			<div className='bg-sidebar flex max-w-md flex-col items-center justify-center gap-y-6 rounded-lg p-10 shadow-sm'>
				<AlertCircleIcon className='text-destructive size-10' />

				<div className='flex flex-col gap-y-2 text-center'>
					<h1 className='text-xl font-semibold'>{title}</h1>
					<p className='text-muted-foreground text-sm'>{description}</p>
				</div>

				<div className='flex flex-wrap items-center justify-center gap-2'>
					{showRetry && onRetry && (
						<Button onClick={onRetry} size='sm'>
							<RotateCcwIcon className='mr-2 size-4' />
							Try Again
						</Button>
					)}

					{showBack && (
						<Button variant='outline' size='sm' onClick={() => router.back()}>
							<ArrowLeftIcon className='mr-2 size-4' />
							Go Back
						</Button>
					)}

					<Button variant={showRetry || showBack ? 'outline' : 'default'} size='sm' asChild>
						<Link href={homeHref}>
							<HomeIcon className='mr-2 size-4' />
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};
