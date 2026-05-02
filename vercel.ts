import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
	crons: [
		{
			path: '/api/cron/ai-settings',
			schedule: '0 0 * * *',
		},
	],
	trailingSlash: false,
};
