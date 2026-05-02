import { auth } from '@clerk/nextjs/server';
import { RateLimiterPrisma } from 'rate-limiter-flexible';

import { DURATION, FREE_POINTS, GENERATION_COST, PRO_POINTS } from '@/modules/usage/config';

import { db } from '@/lib/db';

export const getUsageTracker = async () => {
	const { has } = await auth();
	const hasProAccess = has({ plan: 'pro' });

	const usageTracker = new RateLimiterPrisma({
		duration: DURATION,
		points: hasProAccess ? PRO_POINTS : FREE_POINTS,
		storeClient: db,
		tableName: 'Usage',
	});

	return usageTracker;
};

export const consumeCredits = async () => {
	const { userId } = await auth();

	if (!userId) throw new Error('Unauthorized');

	const usageTracker = await getUsageTracker();
	const result = await usageTracker.consume(userId, GENERATION_COST);

	return result;
};

export const getUsageStatus = async () => {
	const { userId, has } = await auth();

	if (!userId) throw new Error('Unauthorized');

	const hasProAccess = has({ plan: 'pro' });
	const usageTracker = await getUsageTracker();
	const result = await usageTracker.get(userId);

	// Check if user has pro access but their current usage reflects free tier limits
	// This happens when they upgrade from free to pro but the usage record wasn't updated
	if (hasProAccess && result && result.remainingPoints < PRO_POINTS - GENERATION_COST) {
		// The user has pro access but low remaining points, likely from free tier
		// Reset their usage to give them proper pro credits
		await db.usage.delete({
			where: {
				key: userId,
			},
		});

		// Get fresh status with pro limits
		const freshResult = await usageTracker.get(userId);
		return freshResult;
	}

	return result;
};

export const resetUsageForProUpgrade = async () => {
	const { userId, has } = await auth();

	if (!userId) throw new Error('Unauthorized');

	const hasProAccess = has({ plan: 'pro' });

	if (!hasProAccess) {
		throw new Error('User does not have pro access');
	}

	// Delete the existing usage record to force a fresh start with pro limits
	await db.usage.delete({
		where: {
			key: userId,
		},
	});

	// Create a new usage tracker with pro limits and consume to initialize
	const usageTracker = await getUsageTracker();
	await usageTracker.consume(userId, 0); // This will create a new record with pro limits

	return true;
};
