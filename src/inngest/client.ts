import { Inngest } from 'inngest';

// Production signing key configured
export const inngest = new Inngest({
	id: 'inngest-bot',
	signingKey: process.env.INNGEST_SIGNING_KEY,
});
