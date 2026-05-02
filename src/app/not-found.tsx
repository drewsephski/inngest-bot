import Link from 'next/link';

import { ArrowLeft, FileQuestion, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
	return (
		<div className='bg-background flex min-h-screen flex-col items-center justify-center p-4'>
			<div className='max-w-xl space-y-6 text-center'>
				<FileQuestion className='text-primary mx-auto size-20' strokeWidth={2.5} />

				<h1 className='text-foreground text-4xl font-bold'>404 - Page Not Found</h1>
				<p className='text-muted-foreground text-lg'>
					Oops! It looks like the page you&apos;re looking for doesn&apos;t exist. Maybe it was moved or renamed?
				</p>

				<div className='flex items-center justify-center space-x-4'>
					<Button variant='outline' asChild>
						<Link href='/'>
							<ArrowLeft className='size-4' />
							Go Back Home
						</Link>
					</Button>

					<Button asChild>
						<Link href='/'>
							<Home className='size-4' />
							Return to Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
