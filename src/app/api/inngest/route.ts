import { serve } from 'inngest/next';

import { inngest } from '@/inngest/client';
import { codeAgentFunction } from '@/inngest/functions';

// This endpoint can run for a maximum of 300 seconds
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [codeAgentFunction],
});
