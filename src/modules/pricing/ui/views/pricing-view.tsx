'use client';

import Link from 'next/link';

import { PricingTable } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export const PricingView = () => {
	const { resolvedTheme } = useTheme();

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col'>
			{/* Navigation Header */}
			<header className='bg-background/80 fixed top-0 right-0 left-0 z-50 border-b px-4 py-3 backdrop-blur-xl'>
				<div className='mx-auto flex max-w-6xl items-center justify-between'>
					<Link href='/' className='group flex items-center gap-3'>
						<div className='from-primary/15 to-primary/5 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.25)]'>
							<img src='/logo.svg' alt='Nova logo' width={18} height={18} className='relative z-10' />
						</div>
						<span className='text-lg font-semibold tracking-tight'>Nova</span>
					</Link>

					<Button variant='ghost' size='sm' asChild>
						<Link href='/' className='flex items-center gap-1.5'>
							<ArrowLeft className='h-4 w-4' />
							Back to Home
						</Link>
					</Button>
				</div>
			</header>

			<section className='space-y-6 pt-[20vh] 2xl:pt-56'>
				<div className='flex flex-col items-center'>
					<img src='/logo.svg' alt='Nova logo' width={50} height={50} className='hidden md:block' />
				</div>

				<h1 className='text-center text-xl font-bold md:text-3xl'>Pricing</h1>
				<p className='text-muted-foreground text-center text-sm md:text-base'>Choose the plan that fits your needs</p>

				<PricingTable
					appearance={{
						elements: {
							pricingTable: 'border-none! shadow-none! rounded-lg!',
						},
						theme: resolvedTheme === 'dark' ? dark : undefined,
					}}
					checkoutProps={{
						appearance: {
							elements: {
								drawerRoot: 'z-[99999]!',
							},
							theme: resolvedTheme === 'dark' ? dark : undefined,
						},
					}}
				/>
			</section>
		</div>
	);
};
