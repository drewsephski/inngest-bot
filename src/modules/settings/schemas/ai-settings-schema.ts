import { z } from 'zod';

export const AIProviderEnum = z.enum(['OPENAI', 'OPENROUTER']);

export const AISettingsSchema = z.object({
	apiKey: z
		.string()
		.trim()
		.min(12, 'Invalid API key')
		.refine(
			(val) => val.startsWith('sk-') || val.startsWith('sk-or-'),
			'Invalid API key format. Must start with sk- (OpenAI) or sk-or- (OpenRouter)'
		),
	provider: AIProviderEnum,
});
