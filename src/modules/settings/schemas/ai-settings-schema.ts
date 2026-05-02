import { z } from 'zod';

export const AIProviderEnum = z.enum(['OPENAI', 'OPENROUTER']);

export const AISettingsSchema = z
	.object({
		apiKey: z
			.string()
			.trim()
			.optional()
			.refine(
				(val) => !val || val.startsWith('sk-') || val.startsWith('sk-or-'),
				'Invalid API key format. Must start with sk- (OpenAI) or sk-or- (OpenRouter)'
			),
		provider: AIProviderEnum.default('OPENROUTER'),
		useAppKey: z.boolean().default(false),
	})
	.refine(
		(data) => {
			// If not using app key, must provide an API key
			if (!data.useAppKey && (!data.apiKey || data.apiKey.length < 12)) {
				return false;
			}
			return true;
		},
		{
			message: 'API key is required when not using the app key',
			path: ['apiKey'],
		}
	);
