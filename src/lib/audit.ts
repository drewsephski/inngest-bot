import 'server-only';

import type { AIProvider, AuditAction } from '@/generated/prisma/enums';
import { db } from '@/lib/db';

interface AuditLogEntry {
	action: AuditAction;
	details?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
	userId: string;
}

interface UsageAnalyticsEntry {
	aiRequests?: number;
	creditsConsumed?: number;
	messagesSent?: number;
	projectsCreated?: number;
	provider?: AIProvider;
	userId: string;
}

/**
 * Logs an audit event to the database
 */
export const logAuditEvent = async ({ userId, action, details, metadata }: AuditLogEntry) => {
	try {
		await db.auditLog.create({
			data: {
				action,
				details: (details ?? {}) as unknown as Record<string, never>,
				metadata: (metadata ?? {}) as unknown as Record<string, never>,
				userId,
			},
		});
	} catch (error) {
		// Log to console but don't fail the operation
		console.error('Failed to create audit log:', error);
	}
};

/**
 * Updates or creates usage analytics for today
 */
export const trackUsageAnalytics = async ({
	userId,
	creditsConsumed = 0,
	projectsCreated = 0,
	messagesSent = 0,
	aiRequests = 0,
	provider,
}: UsageAnalyticsEntry) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		await db.usageAnalytics.upsert({
			create: {
				aiRequests,
				creditsConsumed,
				date: today,
				messagesSent,
				projectsCreated,
				provider,
				userId,
			},
			update: {
				aiRequests: { increment: aiRequests },
				creditsConsumed: { increment: creditsConsumed },
				messagesSent: { increment: messagesSent },
				projectsCreated: { increment: projectsCreated },
				provider,
			},
			where: {
				// eslint-disable-next-line camelcase
				userId_date: {
					date: today,
					userId,
				},
			},
		});
	} catch (error) {
		console.error('Failed to track usage analytics:', error);
	}
};

/**
 * Get usage analytics for a user
 */
export const getUsageAnalytics = async (userId: string, days = 30) => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	startDate.setHours(0, 0, 0, 0);

	return db.usageAnalytics.findMany({
		orderBy: { date: 'desc' },
		where: {
			date: { gte: startDate },
			userId,
		},
	});
};

/**
 * Get audit logs for a user
 */
export const getAuditLogs = async (userId: string, limit = 50) => {
	return db.auditLog.findMany({
		orderBy: { createdAt: 'desc' },
		take: limit,
		where: { userId },
	});
};
