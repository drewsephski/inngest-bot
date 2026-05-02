'use client';

import Link from 'next/link';

import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { EllipsisVerticalIcon, Loader2Icon, PencilIcon, Sparkles, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

import { useRenameProjectModal } from '@/modules/projects/hooks/use-rename-project-modal';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/hooks/use-confirm';
import { useTRPC } from '@/trpc/client';

interface ProjectItemProps {
	project: {
		id: string;
		name: string;
		createdAt: Date;
	};
}

const ProjectItem = ({ project }: ProjectItemProps) => {
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { onOpen: openRenameModal } = useRenameProjectModal();
	const [ConfirmDialog, confirm] = useConfirm({
		message: 'Are you sure you want to delete this project? This action cannot be undone.',
		title: 'Delete Project',
	});

	const deleteProject = useMutation(
		trpc.projects.remove.mutationOptions({
			onError: (error) => {
				toast.error(error.message || 'Failed to delete project');
			},
			onSuccess: async ({ id }) => {
				await queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
				await queryClient.invalidateQueries(trpc.projects.getOne.queryOptions({ id }));
				toast.success('Project deleted successfully');
			},
		})
	);

	const handleRename = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		openRenameModal(project.id, project.name);
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const ok = await confirm();
		if (!ok) return;
		deleteProject.mutate({ id: project.id });
	};

	const isDeleting = deleteProject.isPending;

	return (
		<div className='group relative'>
			<ConfirmDialog />

			<Button
				variant='outline'
				className='from-card/50 to-card hover:border-primary/20 hover:from-accent/30 hover:to-accent/50 border-border/40 h-auto w-full justify-start border bg-gradient-to-b p-3.5 text-start font-normal shadow-sm transition-all duration-300 hover:shadow-md'
				asChild
			>
				<Link href={`/projects/${project.id}`}>
					<div className='flex items-center gap-x-3.5'>
						<div className='bg-primary/5 border-border/30 group-hover:bg-primary/10 group-hover:border-primary/20 flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors'>
							<img
								src='/logo.svg'
								alt='Nova logo'
								width={18}
								height={18}
								className='opacity-60 transition-opacity group-hover:opacity-80'
							/>
						</div>

						<div className='flex min-w-0 flex-1 flex-col'>
							<h3 className='truncate text-sm font-medium'>{project.name}</h3>
							<p className='text-muted-foreground/70 text-xs'>
								{formatDistanceToNow(project.createdAt, { addSuffix: true })}
							</p>
						</div>
					</div>
				</Link>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						disabled={isDeleting}
						variant='ghost'
						size='icon'
						className='hover:bg-accent absolute top-1/2 right-2 size-7 -translate-y-1/2 rounded-md opacity-0 transition-all duration-200 group-hover:opacity-100'
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						aria-label='More options'
					>
						{isDeleting ? <Loader2Icon className='size-4 animate-spin' /> : <EllipsisVerticalIcon className='size-4' />}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='min-w-[140px]'>
					<DropdownMenuItem onClick={handleRename} disabled={isDeleting} className='text-sm'>
						<PencilIcon className='text-muted-foreground size-3.5' />
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem variant='destructive' onClick={handleDelete} disabled={isDeleting} className='text-sm'>
						<Trash2Icon className='size-3.5' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

// Warm, encouraging empty state for first-time users
const EmptyState = ({ firstName }: { firstName?: string | null }) => (
	<div className='col-span-full py-12 text-center'>
		<div className='from-primary/10 to-primary/5 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br'>
			<Sparkles className='text-primary size-6' />
		</div>
		<p className='text-foreground mb-1 text-sm font-medium'>
			{firstName ? `Welcome, ${firstName}!` : 'Welcome to Nova!'}
		</p>
		<p className='text-muted-foreground font-serif text-sm italic'>
			Describe your business above and we&apos;ll build your first website.
		</p>
	</div>
);

export const ProjectsList = () => {
	const trpc = useTRPC();
	const { user } = useUser();

	const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

	// Not logged in — show nothing (hero CTA is sufficient)
	if (!user) return null;

	return (
		<div className='border-border/60 from-card to-card/95 flex w-full flex-col gap-y-6 rounded-xl border bg-gradient-to-b p-6 shadow-sm sm:gap-y-4 dark:from-zinc-950/50 dark:to-zinc-950/30'>
			<div className='border-border/40 flex items-center justify-between border-b pb-4'>
				<div className='flex items-center gap-2'>
					<div className='bg-primary/10 flex size-8 items-center justify-center rounded-lg'>
						<span className='text-primary text-sm font-semibold'>{user?.firstName?.charAt(0) || 'N'}</span>
					</div>
					<h2 className='text-lg font-semibold tracking-tight'>{user?.firstName}&apos;s Websites</h2>
				</div>
				<span className='bg-muted/60 text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium'>
					{projects?.length || 0} site{projects?.length !== 1 ? 's' : ''}
				</span>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
				{projects?.length === 0 && <EmptyState firstName={user?.firstName} />}
				{projects?.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</div>
		</div>
	);
};
