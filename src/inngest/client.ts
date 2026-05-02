import { Inngest } from 'inngest';

export const inngest = new Inngest({
	id: 'inngest-bot',
	signingKey: process.env.INNGEST_SIGNING_KEY,
});
