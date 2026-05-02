import { Loader2Icon } from 'lucide-react';

/**
 * Loading state for project pages
 * Prevents layout shift while project data is being fetched
 */
export default function ProjectLoading() {
	return (
		<div className='flex h-screen flex-col items-center justify-center gap-4'>
			<div className='flex flex-col items-center gap-3'>
				<div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl'>
					<Loader2Icon className='text-primary h-6 w-6 animate-spin' />
				</div>
				<div className='space-y-1 text-center'>
					<h2 className='text-lg font-medium'>Loading project</h2>
					<p className='text-muted-foreground text-sm'>Fetching your project data...</p>
				</div>
			</div>
		</div>
	);
}
