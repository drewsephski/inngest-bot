import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { CreateMessageSchema } from '@/modules/messages/schemas/create-message-schema';
import { verifyAISettings } from '@/modules/settings/actions';
import { consumeCredits } from '@/modules/usage/lib/usage';

import { env } from '@/env/server';
import { MessageRole, MessageType } from '@/generated/prisma/client';
import { inngest } from '@/inngest/client';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export const messagesRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			CreateMessageSchema.extend({
				projectId: z.uuid().trim().min(1, 'Project ID is required'),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { projectId, value } = input;
			const { userId } = ctx.auth;

			const existingProjectCount = await db.project.count({
				where: {
					id: projectId,
					userId,
				},
			});

			if (existingProjectCount === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

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

				if (!success) throw new TRPCError({ code: 'BAD_REQUEST', message: error || 'Failed to verify API key' });
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

			const message = await db.message.create({
				data: {
					content: value,
					projectId,
					role: MessageRole.USER,
					type: MessageType.RESULT,
				},
			});

			await inngest.send({
				data: {
					projectId,
					value,
				},
				name: 'code-agent/run',
			});

			return message;
		}),
	getMany: protectedProcedure
		.input(
			z.object({
				cursor: z.string().uuid().optional(),
				limit: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
				projectId: z.uuid().trim().min(1, 'Project ID is required'),
			})
		)
		.query(async ({ input, ctx }) => {
			const { cursor, limit, projectId } = input;
			const { userId } = ctx.auth;

			// Use cursor-based pagination for better performance
			const messages = await db.message.findMany({
				cursor: cursor ? { id: cursor } : undefined,
				include: {
					fragment: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
				skip: cursor ? 1 : 0, // Skip the cursor item if using cursor
				take: limit + 1, // Take one extra to determine if there's more
				where: {
					project: {
						userId,
					},
					projectId,
				},
			});

			// Check if there are more messages
			const hasMore = messages.length > limit;
			const items = hasMore ? messages.slice(0, limit) : messages;
			const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

			return {
				items,
				nextCursor,
			};
		}),
});
