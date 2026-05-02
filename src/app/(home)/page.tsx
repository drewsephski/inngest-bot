'use client';

import { useEffect, useState } from 'react';

import { ArrowRight, ExternalLink, Sparkles as SparklesIcon, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

import { ProjectForm } from '@/modules/home/ui/components/project-form';
import { ProjectsList } from '@/modules/home/ui/components/projects-list';
import { TechLogos } from '@/modules/home/ui/components/tech-logos';

import { Sparkles } from '@/components/ui/sparkles';
import { cn } from '@/lib/utils';

const HomePage = () => {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className='relative flex w-full flex-col overflow-hidden'>
			{/* Premium layered background */}
			<div className='pointer-events-none absolute inset-0'>
				{/* Warm gradient orb - top left */}
				<div className='from-primary/20 via-primary/5 absolute -top-40 -left-40 h-[60vh] w-[60vh] rounded-full bg-gradient-to-br to-transparent blur-3xl' />
				{/* Subtle secondary glow - bottom right */}
				<div className='from-primary/10 via-primary/3 absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-gradient-to-tl to-transparent blur-3xl' />
				{/* Noise texture overlay */}
				<div
					className='absolute inset-0 opacity-[0.018]'
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className='relative mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8'>
				{/* Hero Section - Editorial Asymmetric Layout */}
				<section
					className={cn('relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32', mounted && 'animate-fade-in-up')}
				>
					<div className='relative'>
						{/* Editorial Badge */}
						<div
							className={cn(
								'mb-8 inline-flex items-center gap-2',
								mounted && 'animate-fade-in opacity-0 [animation-delay:0.1s]'
							)}
						>
							<div className='group border-border/50 bg-background/80 hover:border-primary/40 hover:bg-background/90 relative flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-md transition-all duration-500'>
								<span className='relative flex h-2 w-2'>
									<span className='bg-primary/70 absolute inline-flex h-full w-full animate-ping rounded-full' />
									<span className='bg-primary relative inline-flex h-2 w-2 rounded-full' />
								</span>
								<span className='text-muted-foreground font-serif text-sm italic'>Your website, built in minutes</span>
							</div>
						</div>

						{/* Editorial Headline */}
						<div className='max-w-4xl space-y-6'>
							<h1
								className={cn(
									'text-foreground text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] font-medium tracking-tight text-balance',
									mounted && 'animate-fade-in-up opacity-0 [animation-delay:0.2s]'
								)}
							>
								<span className='block font-light tracking-tight'>Your business</span>
								<span className='tracking-tight-custom block font-semibold'>deserves a</span>
								<span className='text-primary block font-serif font-normal tracking-normal italic'>great website.</span>
							</h1>

							{/* Subhead - plain language for non-technical audience */}
							<div className={cn('max-w-xl pt-4', mounted && 'animate-fade-in-up opacity-0 [animation-delay:0.35s]')}>
								<p className='text-muted-foreground font-serif text-lg leading-relaxed italic md:text-xl'>
									Describe your business in plain words.
								</p>
								<p className='text-muted-foreground/80 mt-2 text-base leading-relaxed'>
									Nova builds you a real, live website — ready to share with customers. <br />
									No coding, no developer, no hassle.
								</p>
							</div>
						</div>

						{/* Form Section */}
						<div className={cn('mt-12 max-w-2xl', mounted && 'animate-fade-in-up opacity-0 [animation-delay:0.5s]')}>
							{/* Refined ambient glow — even, balanced wrapping around input */}
							<div className='group relative rounded-2xl'>
								{/* Even base glow — symmetrical radial distribution */}
								<div className='pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(ellipse_at_center,var(--primary)/6%,var(--primary)/2%,transparent_70%)] opacity-100 blur-lg' />
								{/* Focus intensification — expands and brightens evenly */}
								<div className='pointer-events-none absolute -inset-2 rounded-2xl bg-[radial-gradient(ellipse_at_center,var(--primary)/12%,var(--primary)/5%,transparent_65%)] opacity-0 blur-xl transition-all duration-500 ease-out group-focus-within:opacity-100' />
								{/* Edge rim — clean border glow on focus */}
								<div className='ring-primary/20 pointer-events-none absolute -inset-px rounded-2xl opacity-0 ring-1 blur-[2px] transition-all duration-500 ease-out ring-inset group-focus-within:opacity-100' />
								<ProjectForm />
							</div>
						</div>

						{/* Trust Indicators */}
						<div
							className={cn(
								'mt-16 flex flex-wrap items-center gap-x-8 gap-y-4',
								mounted && 'animate-fade-in-up opacity-0 [animation-delay:0.65s]'
							)}
						>
							{[
								{ desc: 'Live in minutes, not weeks', icon: Zap, label: 'Instant results' },
								{ desc: 'Real websites, not templates', icon: SparklesIcon, label: 'Built for your business' },
							].map((item) => (
								<div
									key={item.label}
									className='group flex items-center gap-3 transition-all duration-300 hover:translate-x-1'
								>
									<div className='from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300'>
										<item.icon className='text-primary h-5 w-5' />
									</div>
									<div>
										<p className='text-foreground text-sm font-medium'>{item.label}</p>
										<p className='text-muted-foreground font-serif text-xs italic'>{item.desc}</p>
									</div>
								</div>
							))}
							<div className='bg-border/60 hidden h-8 w-px md:block' />
							<a
								href='#examples'
								className='group text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-all duration-300'
							>
								<span>See examples</span>
								<ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
							</a>
						</div>
					</div>
				</section>

				{/* Projects Section with Editorial Divider */}
				<div className={cn('py-8', mounted && 'animate-fade-in opacity-0 [animation-delay:0.8s]')}>
					<div className='mb-12 flex items-center gap-6'>
						<div className='via-border to-border h-px flex-1 bg-gradient-to-r from-transparent' />
						<span className='text-muted-foreground font-serif text-sm italic'>Recent creations</span>
						<div className='via-border to-border h-px flex-1 bg-gradient-to-l from-transparent' />
					</div>
					<ProjectsList />
				</div>

				{/* Tech Stack Marquee */}
				<div className={cn('py-8', mounted && 'animate-fade-in opacity-0 [animation-delay:1s]')}>
					<TechLogos />
				</div>
			</div>

			{/* Premium Sparkles Footer Section */}
			<div className='relative -mt-20 h-[24rem] w-full overflow-hidden [mask-image:radial-gradient(60%_50%,white,transparent)]'>
				<div className='from-primary/20 via-primary/5 absolute inset-0 bg-gradient-to-t to-transparent' />
				<div className='absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,var(--gradient-color),transparent_65%)] before:opacity-60' />
				<div className='border-border/40 bg-background absolute top-1/2 -left-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t' />
				<Sparkles
					density={1200}
					className='absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(60%_50%,white,transparent_80%)]'
					color={theme === 'dark' ? 'var(--sparkles-color)' : 'var(--sparkles-color)'}
				/>
			</div>

			{/* Refined Footer */}
			<footer className='border-border/50 from-background to-muted/10 border-t bg-gradient-to-b px-6 py-16'>
				<div className='mx-auto flex w-full max-w-6xl flex-col gap-12'>
					<div className='flex flex-col items-start justify-between gap-8 md:flex-row md:items-end'>
						<div className='space-y-3'>
							<div className='flex items-center gap-3'>
								<div className='from-primary/15 to-primary/5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br'>
									<SparklesIcon className='text-primary h-5 w-5' />
								</div>
								<span className='text-xl font-semibold tracking-tight'>Nova</span>
							</div>
							<p className='text-muted-foreground max-w-sm font-serif text-sm leading-relaxed italic'>
								Built for small business owners who want a real online presence — without the complexity.
							</p>
						</div>

						<div className='flex items-center gap-1'>
							<a
								href='https://github.com/drewsephski'
								target='_blank'
								rel='noopener noreferrer'
								title='Opens in new tab'
								className='text-muted-foreground hover:text-foreground hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-200'
							>
								GitHub
								<ExternalLink className='h-3 w-3 opacity-60' />
							</a>
						</div>
					</div>

					<div className='border-border/40 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row'>
						<p className='text-muted-foreground text-xs'>© {new Date().getFullYear()} Nova. All rights reserved.</p>
						<p className='text-muted-foreground/60 font-serif text-xs italic'>
							Built with intention. Designed for impact.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
