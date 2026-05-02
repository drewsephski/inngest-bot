/* eslint-disable sort-keys */
const techLogos = [
	{
		name: 'React',
		light: 'https://svgl.app/library/react_light.svg',
		dark: 'https://svgl.app/library/react_dark.svg',
		url: 'https://react.dev/',
	},

	{
		name: 'Next.js',
		route: 'https://svgl.app/library/nextjs_icon_dark.svg',
		url: 'https://nextjs.org/',
	},
	{
		name: 'OpenAI',
		light: 'https://svgl.app/library/openai.svg',
		dark: 'https://svgl.app/library/openai_dark.svg',
		url: 'https://openai.com/',
	},
	{
		name: 'TypeScript',
		route: 'https://svgl.app/library/typescript.svg',
		url: 'https://www.typescriptlang.org',
	},
	{
		name: 'Tailwind CSS',
		route: 'https://svgl.app/library/tailwindcss.svg',
		url: 'https://tailwindcss.com/',
	},

	{
		name: 'Vercel',
		light: 'https://svgl.app/library/vercel.svg',
		dark: 'https://svgl.app/library/vercel_dark.svg',
		url: 'https://vercel.com/',
	},
];

export const TechLogos = () => {
	return (
		<section className='py-12 md:py-16'>
			<div className='space-y-6'>
				<p className='text-muted-foreground text-center text-sm font-medium tracking-wider uppercase'>
					Powered by modern technologies
				</p>
				<div className='flex flex-wrap items-center justify-center gap-8 md:gap-12'>
					{techLogos.map((logo) => (
						<a
							key={logo.name}
							href={logo.url}
							target='_blank'
							rel='noopener noreferrer'
							className='group relative flex items-center justify-center transition-all duration-300 hover:scale-110'
						>
							{logo.route ? (
								<img src={logo.route} alt={logo.name} width={32} height={32} className='h-8 w-auto object-contain' />
							) : (
								<>
									<img
										src={logo.light}
										alt={logo.name}
										width={32}
										height={32}
										className='h-8 w-auto object-contain dark:hidden'
									/>
									<img
										src={logo.dark}
										alt={logo.name}
										width={32}
										height={32}
										className='hidden h-8 w-auto object-contain dark:block'
									/>
								</>
							)}
							<span className='sr-only'>{logo.name}</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
};
