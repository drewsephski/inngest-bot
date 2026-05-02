'use client';

import Link from 'next/link';

import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export const SignInView = () => {
	const { resolvedTheme } = useTheme();

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col'>
			{/* Back to home navigation */}
			<div className='fixed top-4 left-4 z-50'>
				<Button variant='ghost' size='sm' asChild>
					<Link href='/' className='flex items-center gap-1.5'>
						<ArrowLeft className='h-4 w-4' />
						Back to Nova
					</Link>
				</Button>
			</div>

			<section className='space-y-6 pt-[16vh] 2xl:pt-48'>
				<div className='flex flex-col items-center'>
					<SignIn
						appearance={{
							captcha: {
								theme: resolvedTheme === 'dark' ? 'dark' : 'light',
							},
							elements: {
								cardBox: 'border! shadow-none! rounded-lg!',
							},
							theme: resolvedTheme === 'dark' ? dark : undefined,
						}}
					/>
				</div>
			</section>
		</div>
	);
};
