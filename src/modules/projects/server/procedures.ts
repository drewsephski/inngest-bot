import { TRPCError } from '@trpc/server';
import { generateSlug } from 'random-word-slugs';
import { z } from 'zod';

import { CreateProjectSchema } from '@/modules/projects/schemas/create-project-schema';
import { verifyAISettings } from '@/modules/settings/actions';
import { consumeCredits } from '@/modules/usage/lib/usage';

import { env } from '@/env/server';
import { MessageRole, MessageType } from '@/generated/prisma/client';
import { inngest } from '@/inngest/client';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const projectsRouter = createTRPCRouter({
	create: protectedProcedure.input(CreateProjectSchema).mutation(async ({ input, ctx }) => {
		const { value } = input;
		const { userId } = ctx.auth;

		const settings = await db.userSettings.findUnique({
			where: {
				userId,
			},
		});

		const { has } = ctx.auth;
		const hasProAccess = has({ plan: 'pro' });
		const useAppKey = settings?.useAppKey ?? false;

		// Pro users with useAppKey can proceed without stored API key
		// Free users or pro users without useAppKey need a stored API key
		if (!hasProAccess || !useAppKey) {
			if (!settings) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'API key not found' });

			const apiKey = settings.apiKey ? decrypt(settings.apiKey) : null;

			if (!apiKey) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'API key not found' });

			const { error, success } = await verifyAISettings(apiKey, settings.provider);

			if (!success) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: error || 'Failed to verify API key' });
		}

		// For pro users with useAppKey, verify the app API key is configured
		if (hasProAccess && useAppKey && !env.OPENROUTER_API_KEY) {
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'App API key not configured' });
		}

		try {
			await consumeCredits();
		} catch (error) {
			if (error instanceof Error) {
				throw new TRPCError({ code: 'BAD_REQUEST', message: error.message || 'Something went wrong' });
			} else {
				throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: "You've run out of credits" });
			}
		}

		const project = await db.project.create({
			data: {
				messages: {
					create: {
						content: value,
						role: MessageRole.USER,
						type: MessageType.RESULT,
					},
				},
				name: generateSlug(2, {
					format: 'kebab',
				}),
				userId,
			},
		});

		await inngest.send({
			data: {
				projectId: project.id,
				value: value,
			},
			name: 'code-agent/run',
		});

		return project;
	}),
	getMany: protectedProcedure.query(async ({ ctx }) => {
		const { userId } = ctx.auth;

		const projects = await db.project.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			where: {
				userId,
			},
		});

		return projects;
	}),
	getOne: protectedProcedure
		.input(
			z.object({
				id: z.uuid().trim().min(1, 'ID is required'),
			})
		)
		.query(async ({ input, ctx }) => {
			const { id } = input;
			const { userId } = ctx.auth;

			const project = await db.project.findUnique({
				where: {
					id,
					userId,
				},
			});

			// Use consistent error message to prevent project ID enumeration attacks
			// This prevents attackers from distinguishing between "project doesn't exist" vs "you don't have access"
			if (!project) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Project not found or access denied',
				});
			}

			return project;
		}),
	remove: protectedProcedure
		.input(z.object({ id: z.uuid().trim().min(1, 'ID is required') }))
		.mutation(async ({ input, ctx }) => {
			const { id: projectId } = input;
			const { userId } = ctx.auth;

			const project = await db.project.delete({
				where: {
					id: projectId,
					userId,
				},
			});

			return project;
		}),
	update: protectedProcedure
		.input(
			z.object({ id: z.uuid().trim().min(1, 'ID is required'), name: z.string().trim().min(1, 'Name is required') })
		)
		.mutation(async ({ input, ctx }) => {
			const { id: projectId, name } = input;
			const { userId } = ctx.auth;

			const project = await db.project.update({
				data: {
					name,
				},
				where: {
					id: projectId,
					userId,
				},
			});

			return project;
		}),
});
