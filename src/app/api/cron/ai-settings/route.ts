import { NextResponse, type NextRequest } from 'next/server';

import { subDays } from 'date-fns';

import { INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from '@/config/http-status-codes';
import { env } from '@/env/server';
import { db } from '@/lib/db';

/**
 * Data retention and cleanup cron job
 * Runs daily to cleanup:
 * - Expired Usage records (older than 30 days)
 * - Stale AI settings (not updated in 30 days)
 * - Old audit logs (older than 90 days)
 * - Old usage analytics (older than 180 days)
 * - Expired fragments (older than 7 days with no activity)
 */
export async function GET(req: NextRequest) {
	try {
		const authHeader = req.headers.get('authorization');
		if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: UNAUTHORIZED });
		}

		const now = new Date();
		const results = {
			auditLogsDeleted: 0,
			expiredUsageDeleted: 0,
			fragmentsDeleted: 0,
			staleSettingsDeleted: 0,
			usageAnalyticsDeleted: 0,
		};

		// 1. Delete expired usage records (older than 30 days)
		const thirtyDaysAgo = subDays(now, 30);
		const expiredUsage = await db.usage.deleteMany({
			where: {
				expire: {
					lt: now,
				},
			},
		});
		results.expiredUsageDeleted = expiredUsage.count;

		// 2. Delete stale AI settings (not updated in 30 days)
		const staleSettings = await db.userSettings.deleteMany({
			where: {
				updatedAt: {
					lte: thirtyDaysAgo,
				},
			},
		});
		results.staleSettingsDeleted = staleSettings.count;

		// 3. Delete old audit logs (older than 90 days)
		const ninetyDaysAgo = subDays(now, 90);
		const oldAuditLogs = await db.auditLog.deleteMany({
			where: {
				createdAt: {
					lte: ninetyDaysAgo,
				},
			},
		});
		results.auditLogsDeleted = oldAuditLogs.count;

		// 4. Delete old usage analytics (older than 180 days)
		const oneEightyDaysAgo = subDays(now, 180);
		const oldAnalytics = await db.usageAnalytics.deleteMany({
			where: {
				date: {
					lte: oneEightyDaysAgo,
				},
			},
		});
		results.usageAnalyticsDeleted = oldAnalytics.count;

		// 5. Delete old fragments (older than 7 days) to save storage
		const sevenDaysAgo = subDays(now, 7);
		const oldFragments = await db.fragment.deleteMany({
			where: {
				createdAt: {
					lte: sevenDaysAgo,
				},
			},
		});
		results.fragmentsDeleted = oldFragments.count;

		console.warn('Cleanup job completed:', results);

		return NextResponse.json({
			results,
			status: OK,
			timestamp: now.toISOString(),
		});
	} catch (error) {
		console.error('Cleanup job failed:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to run cleanup' },
			{ status: INTERNAL_SERVER_ERROR }
		);
	}
}
