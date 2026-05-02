import { Sparkles } from 'lucide-react';

import { ProjectForm } from '@/modules/home/ui/components/project-form';
import { ProjectsList } from '@/modules/home/ui/components/projects-list';

const HomePage = () => {
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
								<Sparkles className='text-primary size-3' />
								<span className='text-muted-foreground'>AI-powered app builder</span>
							</div>
						</div>

						{/* Headline */}
						<div className='space-y-4 text-center'>
							<h1 className='text-foreground text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.1] font-semibold tracking-tight text-balance'>
								Build something
								<br />
								with Nova
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
			</div>
		</div>
	);
};

export default HomePage;
