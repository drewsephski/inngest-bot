import { getUsageStatus, resetUsageForProUpgrade } from '@/modules/usage/lib/usage';

import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const usageRouter = createTRPCRouter({
	resetForProUpgrade: protectedProcedure.mutation(async () => {
		try {
			await resetUsageForProUpgrade();
			return { success: true };
		} catch (error) {
			return { error: error instanceof Error ? error.message : 'Unknown error', success: false };
		}
	}),
	status: protectedProcedure.query(async () => {
		try {
			const result = await getUsageStatus();

			return result;
		} catch {
			return null;
		}
	}),
});
