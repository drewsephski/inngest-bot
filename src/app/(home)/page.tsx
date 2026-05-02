'use client';

import { Sparkles as SparklesIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { ProjectForm } from '@/modules/home/ui/components/project-form';
import { ProjectsList } from '@/modules/home/ui/components/projects-list';
import { TechLogos } from '@/modules/home/ui/components/tech-logos';

import { BubbleText } from '@/components/ui/bubble-text';
import { Sparkles } from '@/components/ui/sparkles';

const HomePage = () => {
	const { theme } = useTheme();

	return (
		<div className='relative flex w-full flex-col'>
			{/* Full-width gradient background */}
			<div className='from-primary/5 via-primary/2 pointer-events-none absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b to-transparent' />

			<div className='mx-auto flex w-full max-w-5xl flex-col'>
				<section className='relative py-[4vh] pt-12 md:py-[8vh] 2xl:py-24'>
					<div className='relative space-y-8'>
						{/* Badge */}
						<div className='flex justify-center'>
							<div className='bg-background/80 border-border/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm'>
								<SparklesIcon className='text-primary size-3' />
								<span className='text-muted-foreground'>AI-powered app builder</span>
							</div>
						</div>

						{/* Headline */}
						<div className='space-y-4 text-center'>
							<h1 className='text-foreground text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.1] font-semibold tracking-tight text-balance'>
								<BubbleText text='Build something' />
								<br />
								<BubbleText text='with Nova' />
							</h1>
							<p className='text-muted-foreground mx-auto max-w-md text-base leading-relaxed text-balance md:text-lg'>
								Describe what you want, watch it come to life. No setup, no boilerplate.
							</p>
						</div>

						{/* Form */}
						<div className='mx-auto w-full max-w-2xl pt-2'>
							<ProjectForm />
						</div>
					</div>
				</section>

				<ProjectsList />
				<TechLogos />
			</div>

			{/* Sparkles section */}
			<div className='relative -mt-32 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]'>
				<div className='from-primary/40 absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,var(--gradient-color),transparent_70%)] before:opacity-40' />
				<div className='border-border bg-background absolute top-1/2 -left-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t' />
				<Sparkles
					density={1200}
					className='absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]'
					color={theme === 'dark' ? 'var(--sparkles-color)' : 'var(--sparkles-color)'}
				/>
			</div>

			{/* Footer */}
			<footer className='bg-background border-t px-6 py-12'>
				<div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 md:flex-row'>
					<div className='flex items-center gap-2'>
						<SparklesIcon className='text-primary size-5' />
						<span className='text-foreground font-semibold'>Nova</span>
					</div>

					<p className='text-muted-foreground text-sm'>{new Date().getFullYear()} Nova. Built with AI.</p>

					<div className='flex items-center gap-6'>
						<a
							href='https://github.com/drewsephski'
							target='_blank'
							rel='noopener noreferrer'
							className='text-muted-foreground hover:text-foreground transition-colors'
						>
							GitHub
						</a>
						<a
							href='#'
							className='text-muted-foreground hover:text-foreground transition-colors'
						>
							Privacy
						</a>
						<a
							href='#'
							className='text-muted-foreground hover:text-foreground transition-colors'
						>
							Terms
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;

