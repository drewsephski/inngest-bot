'use client';

import Link from 'next/link';

import { ClerkLoaded, ClerkLoading, Show, SignInButton, SignUpButton } from '@clerk/nextjs';

import { CreditsBadge } from '@/modules/usage/ui/components/credits-badge';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserControl } from '@/components/user-control';
import { LINKS } from '@/config';
import { SafeExternalLink } from '@/components/safe-external-link';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScroll } from '@/hooks/use-scroll';

export const Navbar = () => {
	const isScrolled = useScroll();
	const isMobile = useIsMobile();

	return (
		<nav
			className={cn(
				'fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-out',
				isScrolled
					? 'border-border/50 bg-background/80 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl'
					: 'border-transparent bg-transparent py-4'
			)}
		>
			<div className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8'>
				<Link href='/' className='group flex items-center gap-3'>
					<div className='from-primary/15 to-primary/5 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.25)]'>
						<div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
						<img src='/logo.svg' alt='Nova logo' width={18} height={18} className='relative z-10' />
					</div>
					<span className='text-lg font-semibold tracking-tight'>Nova</span>
				</Link>

				<div className='flex items-center gap-3'>
					<ClerkLoading>
						<div className='flex items-center gap-2'>
							<Skeleton className='h-9 w-[72px] rounded-lg' />
							<Skeleton className='h-9 w-[72px] rounded-lg' />
						</div>
					</ClerkLoading>

					<ClerkLoaded>
						<Show when='signed-out'>
							<div className='flex items-center gap-2'>
								<div className='hidden sm:block'>
									<SignUpButton>
										<Button
											variant='outline'
											size='sm'
											className='border-border/60 bg-background/50 hover:border-primary/40 hover:bg-accent/60 rounded-lg px-4 transition-all duration-300'
										>
											Sign up
										</Button>
									</SignUpButton>
								</div>

								<SignInButton>
									<Button
										size='sm'
										className='hover:shadow-primary/10 rounded-lg px-4 shadow-sm transition-all duration-300 hover:shadow-md'
									>
										Sign in
									</Button>
								</SignInButton>
							</div>
						</Show>

						<Show when='signed-in'>
							<div className='flex items-center gap-4'>
								<div className='hidden sm:flex'>
									<CreditsBadge />
								</div>
								<div className='bg-border/60 hidden h-4 w-px sm:block' />
								<UserControl showName={!isMobile} />
							</div>
						</Show>
					</ClerkLoaded>

					<div className='bg-border/60 hidden h-4 w-px sm:block' />

					<ThemeToggle />

					<SafeExternalLink
						href={LINKS.INSTAGRAM}
						className='hover:bg-muted/50 group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg opacity-70 transition-all duration-300 hover:opacity-100'
						title='Instagram'
					>
						<img
							src='https://svgl.app/library/instagram-icon.svg'
							alt='Instagram'
							height={20}
							width={20}
							className='transition-transform duration-300 group-hover:scale-110'
						/>
					</SafeExternalLink>
				</div>
			</div>
		</nav>
	);
};
