import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: process.env.INNGEST_EVENT_KEY || 'vibe',
  signingKey: process.env.INNGEST_SIGNING_KEY 
});
