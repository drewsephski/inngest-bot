'use client';

import Link from 'next/link';

import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { EllipsisVerticalIcon, Loader2Icon, PencilIcon, Trash2Icon } from 'lucide-react';
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
				className='bg-background hover:border-primary/20 hover:bg-accent h-auto w-full justify-start border p-4 text-start font-normal transition-all'
				asChild
			>
				<Link href={`/projects/${project.id}`}>
					<div className='flex items-center gap-x-4'>
						<div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg'>
							<img src='/logo.svg' alt='Nova logo' width={20} height={20} className='opacity-70' />
						</div>

						<div className='flex flex-1 flex-col'>
							<h3 className='truncate font-medium'>{project.name}</h3>

							<p className='text-muted-foreground text-sm'>
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
						className='absolute top-1/2 right-2 size-7 -translate-y-1/2 opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0'
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						aria-label='More options'
					>
						{isDeleting ? <Loader2Icon className='size-4 animate-spin' /> : <EllipsisVerticalIcon className='size-4' />}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuItem onClick={handleRename} disabled={isDeleting}>
						<PencilIcon className='text-muted-foreground size-4' />
						Rename
					</DropdownMenuItem>

					<DropdownMenuItem variant='destructive' onClick={handleDelete} disabled={isDeleting}>
						<Trash2Icon className='size-4' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export const ProjectsList = () => {
	const trpc = useTRPC();
	const { user } = useUser();

	const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

	if (!user) return null;

	return (
		<div className='flex w-full flex-col gap-y-6 rounded-xl border bg-white p-6 sm:gap-y-4 dark:bg-zinc-950/50'>
			<div className='flex items-center justify-between'>
				<h2 className='text-lg font-medium'>{user?.firstName}&apos;s Novas</h2>
				<span className='text-muted-foreground text-sm'>
					{projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
				</span>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
				{projects?.length === 0 && (
					<div className='col-span-full text-center'>
						<p className='text-muted-foreground text-sm'>No projects found</p>
					</div>
				)}

				{projects?.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</div>
		</div>
	);
};
