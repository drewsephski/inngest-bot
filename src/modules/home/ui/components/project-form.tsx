'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useClerk } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Coffee, Hammer, Home, Scissors, ShoppingBag, Star, UtensilsCrossed } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';

import { usePricingModal } from '@/modules/pricing/hooks/use-pricing-modal';
import { CreateProjectSchema } from '@/modules/projects/schemas/create-project-schema';
import { useSettingsModal } from '@/modules/settings/hooks/use-settings-modal';

import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';

const STORAGE_KEY = 'project-form-value';

// Business-friendly templates for non-technical small business owners
const BUSINESS_TEMPLATES = [
	{
		icon: Coffee,
		prompt:
			'Build a warm, inviting website for a local bakery and café. Include a hero section with a welcoming headline, a menu section with pastries and drinks, an about section with the story behind the business, customer testimonials, and a contact section with hours and location. Use soft, warm tones.',
		title: 'Bakery & café',
	},
	{
		icon: Scissors,
		prompt:
			'Build a stylish website for a hair salon and spa. Include a hero with a booking call-to-action, a services menu with pricing, a team/stylist section, a photo gallery, customer reviews, and a contact form. Use an elegant, modern aesthetic.',
		title: 'Salon & spa',
	},
	{
		icon: Hammer,
		prompt:
			'Build a professional website for a home services contractor (plumbing, electrical, or general handyman). Include a clear hero with a call-to-action to get a quote, a services list, a why-choose-us section, customer testimonials, and a contact form. Use a clean, trustworthy design.',
		title: 'Home services',
	},
	{
		icon: Star,
		prompt:
			'Build a clean portfolio website for a freelancer or creative professional. Include a hero with a short bio and call-to-action, a portfolio grid of sample projects, a skills or services section, and a contact form. Use a minimal, confident aesthetic.',
		title: 'Portfolio',
	},
	{
		icon: ShoppingBag,
		prompt:
			'Build a small online shop landing page for a local boutique or artisan seller. Include a hero section, a featured products grid with prices, an about section, customer reviews, and a contact or order section. Use a clean, friendly shopping aesthetic.',
		title: 'Small shop',
	},
	{
		icon: UtensilsCrossed,
		prompt:
			'Build an appetizing website for a restaurant or food business. Include a hero with a reservations or order call-to-action, a menu section organized by category, a story/about section, a photo gallery, and location and hours. Use rich, food-friendly visuals.',
		title: 'Restaurant',
	},
	{
		icon: Home,
		prompt:
			'Build a professional website for a real estate agent or property business. Include a hero with a search or contact call-to-action, a featured listings section, an about/credentials section, client testimonials, and a contact form. Use a clean, trustworthy design.',
		title: 'Real estate',
	},
] as const;

export const ProjectForm = () => {
	const router = useRouter();
	const { openSignUp } = useClerk();
	const { resolvedTheme } = useTheme();
	const { onOpen: openSettingsModal } = useSettingsModal();
	const { open: openPricingModal } = usePricingModal();

	const [isFocused, setIsFocused] = useState(false);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const form = useForm<z.infer<typeof CreateProjectSchema>>({
		defaultValues: {
			value: '',
		},
		resolver: zodResolver(CreateProjectSchema),
	});

	// Load value from localStorage on mount
	useEffect(() => {
		const savedValue = localStorage.getItem(STORAGE_KEY);
		if (savedValue) {
			form.setValue('value', savedValue, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Watch for value changes and save to localStorage
	const formValue = form.watch('value');
	useEffect(() => {
		if (formValue) {
			localStorage.setItem(STORAGE_KEY, formValue);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [formValue]);

	const createProject = useMutation(
		trpc.projects.create.mutationOptions({
			onError: (error) => {
				if (error.data?.code === 'UNAUTHORIZED') {
					return openSignUp({
						appearance: {
							captcha: {
								theme: resolvedTheme === 'dark' ? 'dark' : 'light',
							},
							elements: {
								cardBox: 'border! shadow-none! rounded-lg!',
							},
							theme: resolvedTheme === 'dark' ? dark : undefined,
						},
					});
				}

				if (error.data?.code === 'PRECONDITION_FAILED') {
					toast.error(error.message || 'Failed to verify API key');
					return openSettingsModal();
				}

				if (error.data?.code === 'TOO_MANY_REQUESTS') return openPricingModal();

				toast.error(error.message || 'Failed to create project');
			},
			onSuccess: ({ id }) => {
				queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
				queryClient.invalidateQueries(trpc.usage.status.queryOptions());

				localStorage.removeItem(STORAGE_KEY);

				router.push(`/projects/${id}`);
			},
		})
	);

	const onSubmit = async (values: z.infer<typeof CreateProjectSchema>) => {
		await createProject.mutateAsync({
			value: values.value,
		});
	};

	const onSelect = (content: string) => {
		form.setValue('value', content, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	};

	const isPending = createProject.isPending;
	const isDisabled = isPending || !form.formState.isValid;

	return (
		<Form {...form}>
			<section className='space-y-4'>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className={cn(
						'from-card to-card/95 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 pt-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-500 ease-out',
						isFocused && 'border-primary/25 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
					)}
				>
					<FormField
						control={form.control}
						name='value'
						render={({ field }) => (
							<TextareaAutosize
								{...field}
								disabled={isPending}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								minRows={2}
								maxRows={8}
								className='placeholder:text-muted-foreground/50 w-full resize-none border-none bg-transparent pt-3 text-lg leading-relaxed transition-all duration-300 outline-none'
								placeholder='Describe your business — what you do, who you serve, and what your website should say.'
								onKeyDown={(e) => {
									if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
										e.preventDefault();
										form.handleSubmit(onSubmit)(e);
									}
								}}
								autoFocus
							/>
						)}
					/>

					<div className='flex items-end justify-between gap-x-3 pt-3'>
						<div className='text-muted-foreground flex items-center gap-2.5 text-[11px] font-medium'>
							<kbd className='bg-muted/80 text-muted-foreground border-border/50 pointer-events-none inline-flex h-6 items-center gap-1 rounded-lg border px-2 font-mono text-[11px] shadow-sm select-none'>
								<span>⌘</span>Enter
							</kbd>
							<span className='text-muted-foreground/70 font-serif italic'>to submit</span>
						</div>

						<Button
							disabled={isDisabled}
							isLoading={isPending}
							className={cn(
								'size-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out',
								// No hover:scale — removed per design brief
								isDisabled && 'bg-muted-foreground/50'
							)}
						>
							{!isPending && <ArrowUpIcon className='size-4.5' />}
						</Button>
					</div>
				</form>

				{/* Business-friendly template chips */}
				<div className='hidden max-w-3xl flex-wrap justify-start gap-2 md:flex'>
					{BUSINESS_TEMPLATES.map((template) => {
						const Icon = template.icon;
						return (
							<Button
								key={template.title}
								variant='outline'
								size='sm'
								className='from-background/80 to-muted/30 hover:border-primary/25 hover:bg-accent/80 border-border/50 gap-2 rounded-xl bg-gradient-to-b px-4 py-2 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
								onClick={() => {
									onSelect(template.prompt);
									form.setFocus('value');
								}}
							>
								{Icon && <Icon className='text-muted-foreground/80 size-3.5 transition-colors duration-300' />}
								{template.title}
							</Button>
						);
					})}
				</div>

				{/* Helper nudge for first-timers */}
				<p className='text-muted-foreground/60 pl-1 font-serif text-xs italic'>
					Not sure where to start? Pick a business type above to get a head start.
				</p>
			</section>
		</Form>
	);
};
