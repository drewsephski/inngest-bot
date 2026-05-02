/* eslint-disable sort-keys */
/* eslint-disable react-hooks/incompatible-library */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EyeIcon, EyeOffIcon, Loader2Icon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { AISettingsSchema } from '@/modules/settings/schemas/ai-settings-schema';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useConfirm } from '@/hooks/use-confirm';
import { useTRPC } from '@/trpc/client';

export const AISettingsForm = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { user } = useUser();
	const [apiKeyVisible, setApiKeyVisible] = useState(false);

	// Check if user has pro access
	const hasProAccess = user?.publicMetadata?.plan === 'pro';

	const [ConfirmDialog, confirm] = useConfirm({
		message: 'Are you sure you want to remove the API Key? This action cannot be undone.',
		title: 'Remove API Key',
	});

	const { data: aiSettings, isLoading } = useQuery(trpc.settings.getAISettings.queryOptions());

	type AISettingsFormValues = z.infer<typeof AISettingsSchema>;

	const form = useForm<AISettingsFormValues>({
		defaultValues: {
			apiKey: aiSettings?.apiKey || '',
			provider: (aiSettings?.provider as AISettingsFormValues['provider']) || 'OPENROUTER',
			useAppKey: aiSettings?.useAppKey ?? false,
		},
		resolver: zodResolver(AISettingsSchema),
	});

	const saveAISettings = useMutation(
		trpc.settings.saveAISettings.mutationOptions({
			onError: (error) => {
				toast.error(error.message || 'Failed to save API Key');
			},
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.settings.getAISettings.queryOptions());

				toast.success('API Key saved successfully');
			},
		})
	);

	const removeAISettings = useMutation(
		trpc.settings.removeAISettings.mutationOptions({
			onError: (error) => {
				toast.error(error.message || 'Failed to remove API Key');
			},
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.settings.getAISettings.queryOptions());

				form.reset({
					apiKey: '',
					provider: 'OPENAI',
				});

				toast.success('API Key removed successfully');
			},
		})
	);

	const handleSubmit = (values: z.infer<typeof AISettingsSchema>) => {
		saveAISettings.mutate(values);
	};

	const handleRemove = async () => {
		const ok = await confirm();
		if (!ok) return;

		removeAISettings.mutate();
	};

	const isPending = saveAISettings.isPending || removeAISettings.isPending;

	const useAppKey = form.watch('useAppKey');

	useEffect(() => {
		if (aiSettings) {
			form.setValue('apiKey', aiSettings.apiKey);
			form.setValue('provider', aiSettings.provider as AISettingsFormValues['provider']);
			form.setValue('useAppKey', aiSettings.useAppKey ?? false);
		}
	}, [aiSettings, form]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<Loader2Icon className='size-5 animate-spin' />
				<span className='sr-only'>Loading...</span>
			</div>
		);
	}

	const provider = form.watch('provider');

	const getProviderConfig = (prov: string) => {
		if (prov === 'OPENROUTER') {
			return {
				label: 'OpenRouter API Key',
				placeholder: 'sk-or-v1-•••••••••••••••••••••••••••••••',
				docsUrl: 'https://openrouter.ai/settings/keys',
				docsLabel: 'OpenRouter',
			};
		}
		return {
			label: 'OpenAI API Key',
			placeholder: 'sk-proj-•••••••••••••••••••••••••••••••',
			docsUrl: 'https://platform.openai.com/account/api-keys',
			docsLabel: 'OpenAI',
		};
	};

	const providerConfig = getProviderConfig(provider);

	return (
		<>
			<ConfirmDialog />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8' autoComplete='off' autoCapitalize='off'>
					<FormField
						disabled={isPending}
						control={form.control}
						name='provider'
						render={({ field }) => (
							<FormItem>
								<FormLabel>AI Provider</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Select AI provider' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value='OPENAI'>OpenAI</SelectItem>
										<SelectItem value='OPENROUTER'>OpenRouter</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>Choose your preferred AI provider for code generation.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{hasProAccess && (
						<FormField
							control={form.control}
							name='useAppKey'
							render={({ field }) => (
								<FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
									<div className='space-y-0.5'>
										<FormLabel className='flex items-center gap-2 text-base'>
											<SparklesIcon className='text-primary size-4' />
											Use Inngest Bot API Key
										</FormLabel>
										<FormDescription>
											Use our API key instead of your own. Powered by DeepSeek V4 Flash.
										</FormDescription>
									</div>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
									</FormControl>
								</FormItem>
							)}
						/>
					)}

					<FormField
						disabled={isPending}
						control={form.control}
						name='apiKey'
						render={({ field }) => (
							<FormItem>
								<FormLabel>{providerConfig.label}</FormLabel>
								<div className='relative'>
									<FormControl className='pr-12'>
										<Input
											type={apiKeyVisible ? 'text' : 'password'}
											placeholder={providerConfig.placeholder}
											disabled={useAppKey}
											{...field}
										/>
									</FormControl>

									<button
										disabled={isPending}
										type='button'
										className='text-muted-foreground ring-primary absolute inset-y-0 right-1 flex cursor-pointer items-center rounded-full p-3 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50'
										onClick={() => {
											setApiKeyVisible((prevApiKeyVisible) => !prevApiKeyVisible);
											form.setFocus('apiKey');
										}}
									>
										{apiKeyVisible ? <EyeOffIcon className='size-5' /> : <EyeIcon className='size-5' />}
									</button>
								</div>

								<FormDescription>
									{useAppKey ? (
										<span className='text-muted-foreground'>
											Using Inngest Bot&apos;s API key. No personal API key required.
										</span>
									) : (
										<>
											Get your API Key from{' '}
											<Link
												href={providerConfig.docsUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary font-medium underline underline-offset-2 opacity-100 hover:opacity-75'
											>
												{providerConfig.docsLabel}
											</Link>
											. The key is automatically deleted after 30 days.
										</>
									)}
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex justify-end gap-2'>
						{(!!aiSettings?.apiKey.trim() || useAppKey) && (
							<Button
								variant='destructive'
								type='button'
								disabled={isPending}
								isLoading={removeAISettings.isPending}
								onClick={handleRemove}
							>
								<Trash2Icon className='size-4' />
								Remove API Key
							</Button>
						)}

						<Button type='submit' disabled={isPending} isLoading={saveAISettings.isPending}>
							Save
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
