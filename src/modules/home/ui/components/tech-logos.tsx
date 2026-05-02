'use client';

import { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';

interface SVGData {
	id: number;
	title: string;
	category: string | string[];
	route: string | { light: string; dark: string };
	url: string;
}

const priorityOrder = [
	'React',
	'Next.js',
	'OpenAI',
	'Claude',
	'TypeScript',
	'Tailwind CSS',
	'Vercel',
	'Prisma',
	'Supabase',
	'tRPC',
	'Zod',
	'Framer',
	'Figma',
	'Linear',
	'Raycast',
	'shadcnui',
	'Clerk',
	'TanStack Query',
];

const LogoItem = ({ logo }: { logo: SVGData }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const getSrc = () => {
		if (typeof logo.route === 'string') {
			return logo.route;
		}
		return isDark ? logo.route.dark : logo.route.light;
	};

	return (
		<a
			href={logo.url}
			target='_blank'
			rel='noopener noreferrer'
			// No hover:scale — removed per design brief. Grayscale lift + opacity only.
			className='group relative flex h-14 items-center justify-center px-6 grayscale transition-all duration-500 ease-out hover:grayscale-0'
		>
			<div className='relative flex h-8 w-8 items-center justify-center'>
				<img
					src={getSrc()}
					alt={logo.title}
					width={32}
					height={32}
					className='h-7 w-auto max-w-7 object-contain opacity-50 transition-all duration-500 ease-out group-hover:opacity-100'
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = 'none';
					}}
				/>
			</div>
			<span className='sr-only'>{logo.title}</span>
		</a>
	);
};

export const TechLogos = () => {
	const [logos, setLogos] = useState<SVGData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLogos = async () => {
			try {
				const response = await fetch('https://api.svgl.app');
				const data: SVGData[] = await response.json();

				const targetTitles = [
					'React',
					'Next.js',
					'OpenAI',
					'Claude',
					'TypeScript',
					'Tailwind CSS',
					'Vercel',
					'Prisma',
					'Supabase',
					'tRPC',
					'Zod',
					'Framer',
					'Figma',
					'Linear',
					'Raycast',
					'shadcnui',
					'Clerk',
					'TanStack Query',
				];

				const filtered = data.filter((svg) => targetTitles.includes(svg.title));
				const sorted = filtered.sort((a, b) => {
					const aIndex = priorityOrder.indexOf(a.title);
					const bIndex = priorityOrder.indexOf(b.title);
					return aIndex - bIndex;
				});

				setLogos(sorted);
			} catch (error) {
				console.error('Failed to fetch SVGL logos:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchLogos();
	}, []);

	const doubledLogos = [...logos, ...logos];

	if (loading) {
		return (
			<section className='relative overflow-hidden py-14 md:py-20'>
				<div className='space-y-8'>
					<p className='text-muted-foreground/60 text-center font-serif text-sm italic'>Loading technologies...</p>
					<div className='flex items-center justify-center gap-4'>
						{[...Array(6)].map((_, i) => (
							<div key={i} className='bg-muted/50 h-8 w-8 animate-pulse rounded-lg' />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (logos.length === 0) {
		return null;
	}

	return (
		<section className='relative overflow-hidden py-14 md:py-20'>
			{/* Gradient masks */}
			<div className='from-background via-background/80 pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r to-transparent' />
			<div className='from-background via-background/80 pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l to-transparent' />

			<div className='space-y-10'>
				<p className='text-muted-foreground/60 text-center font-serif text-sm tracking-wide italic'>
					Powered by industry-leading technologies
				</p>

				{/*
					Marquee fix: the pause-on-hover is applied via a CSS group pattern.
					The `group` class is on the OUTER wrapper div.
					The animated track uses `group-hover:[animation-play-state:paused]`
					directly on itself — this is the correct pattern for Tailwind.
				*/}
				<div className='group relative flex overflow-hidden'>
					<div className='animate-marquee flex items-center gap-1 group-hover:[animation-play-state:paused]'>
						{doubledLogos.map((logo, idx) => (
							<LogoItem key={`${logo.id}-${idx}`} logo={logo} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
};
