'use client';

import { useState } from 'react';

import { useClerk } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';

import { CreateMessageSchema } from '@/modules/messages/schemas/create-message-schema';
import { useSettingsModal } from '@/modules/settings/hooks/use-settings-modal';

import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';

import { Usage } from './usage';

interface MessageFormProps {
	projectId: string;
}

export const MessageForm = ({ projectId }: MessageFormProps) => {
	const { openSignUp } = useClerk();
	const { resolvedTheme } = useTheme();
	const { onOpen: openSettingsModal } = useSettingsModal();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [isFocused, setIsFocused] = useState(false);

	const { data: usage } = useQuery(trpc.usage.status.queryOptions());

	const form = useForm<z.infer<typeof CreateMessageSchema>>({
		defaultValues: {
			value: '',
		},
		resolver: zodResolver(CreateMessageSchema),
	});

	const createMessage = useMutation(
		trpc.messages.create.mutationOptions({
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

				if (error.data?.code === 'TOO_MANY_REQUESTS') {
					toast.error("You've run out of credits. Upgrade to continue or add your own API key.");
					return openSettingsModal();
				}

				toast.error(error.message || 'Failed to create message');
			},
			onSuccess: () => {
				form.reset();

				queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({ projectId }));
				queryClient.invalidateQueries(trpc.usage.status.queryOptions());
			},
		})
	);

	const onSubmit = async (values: z.infer<typeof CreateMessageSchema>) => {
		await createMessage.mutateAsync({
			projectId,
			value: values.value,
		});
	};

	const isPending = createMessage.isPending;
	const isDisabled = isPending || !form.formState.isValid;
	const showUsage = !!usage;

	return (
		<Form {...form}>
			{showUsage && <Usage points={usage.remainingPoints} msBeforeNext={usage.msBeforeNext} />}

			<div className='relative'>
				{/* Ambient subtle glow on focus */}
				<div
					className={cn(
						'bg-primary/10 pointer-events-none absolute -inset-1.5 rounded-xl opacity-0 blur-xl transition-all duration-500 ease-out',
						isFocused && 'opacity-100',
						showUsage && 'rounded-t-none'
					)}
				/>
				{/* Edge rim glow */}
				<div
					className={cn(
						'ring-primary/25 pointer-events-none absolute -inset-px rounded-xl opacity-0 ring-1 blur-[1px] transition-all duration-500 ease-out ring-inset',
						isFocused && 'opacity-100',
						showUsage && 'rounded-t-none'
					)}
				/>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className={cn(
						'bg-sidebar dark:bg-sidebar relative overflow-hidden rounded-xl border p-4 pt-1 transition-all duration-500 ease-out',
						isFocused && 'border-primary/40 shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
						showUsage && 'rounded-t-none'
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
								className={cn(
									'w-full resize-none border-none bg-transparent pt-4 outline-none',
									!field.value &&
									'overflow-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
								)}
								placeholder='What would you like to build?'
								onKeyDown={(e) => {
									if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
										e.preventDefault();
										form.handleSubmit(onSubmit)(e);
									}
								}}
							/>
						)}
					/>

					<div className='flex items-end justify-between gap-x-2 pt-2'>
						<div className='text-muted-foreground font-mono text-[10px]'>
							<kbd className='bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none'>
								<span>&#8984;</span>Enter
							</kbd>
							&nbsp;to submit
						</div>

						<Button
							disabled={isDisabled}
							isLoading={isPending}
							className={cn('size-8 rounded-full', isDisabled && 'bg-muted-foreground border')}
						>
							{!isPending && <ArrowUpIcon className='size-4' />}
						</Button>
					</div>
				</form>
			</div>
		</Form>
	);
};
