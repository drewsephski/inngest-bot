/* eslint-disable sort-keys */
import { OpenRouter } from '@openrouter/sdk';
import * as errors from '@openrouter/sdk/models/errors';

export interface OpenRouterConfig {
	apiKey: string;
	httpReferer?: string;
	appTitle?: string;
}

/**
 * Creates an OpenRouter client with best practices:
 * - Proper authentication headers
 * - Application identification for OpenRouter rankings
 * - Type-safe configuration
 */
export const createOpenRouterClient = (config: OpenRouterConfig) => {
	return new OpenRouter({
		apiKey: config.apiKey,
		// Required for OpenRouter to identify your app in their rankings
		httpReferer: config.httpReferer || process.env.NEXT_PUBLIC_APP_BASE_URL,
		appTitle: config.appTitle || 'Inngest Bot',
	});
};

/**
 * Provider routing preferences for OpenRouter requests.
 * Use this to control which providers are used and how requests are routed.
 */
export interface ProviderPreferences {
	/** Whether to allow backup providers if primary is unavailable. Default: true */
	allowFallbacks?: boolean;
	/** Only use providers that support all provided parameters. Default: false */
	requireParameters?: boolean;
	/** Control data collection: 'allow' (default) or 'deny' */
	dataCollection?: 'allow' | 'deny';
	/** Zero Data Retention - only use providers that don't retain prompts. Default: false */
	zdr?: boolean;
	/** Ordered list of provider slugs to attempt (e.g., ['openai', 'anthropic']) */
	order?: string[];
	/** Whitelist of provider slugs to allow */
	only?: string[];
	/** Blacklist of provider slugs to ignore */
	ignore?: string[];
	/** Sort providers by 'price', 'throughput', or 'latency' */
	sortBy?: 'price' | 'throughput' | 'latency';
}

/**
 * Converts provider preferences to OpenRouter provider object format
 */
export const buildProviderConfig = (prefs: ProviderPreferences = {}) => {
	return {
		allowFallbacks: prefs.allowFallbacks ?? true,
		requireParameters: prefs.requireParameters ?? false,
		dataCollection: prefs.dataCollection ?? 'allow',
		zdr: prefs.zdr ?? false,
		...(prefs.order && { order: prefs.order }),
		...(prefs.only && { only: prefs.only }),
		...(prefs.ignore && { ignore: prefs.ignore }),
		...(prefs.sortBy && { sort: { by: prefs.sortBy, partition: 'model' } }),
	};
};

/**
 * Error handler with typed responses following OpenRouter SDK best practices.
 * Catches and identifies specific API error types.
 */
export const handleOpenRouterError = (error: unknown): { message: string; code: string; retryAfter?: number } => {
	if (error instanceof errors.BadRequestResponseError) {
		return { message: `Bad request: ${error.message}`, code: 'bad_request' };
	}

	if (error instanceof errors.UnauthorizedResponseError) {
		return { message: 'Invalid API key. Please check your OpenRouter API key.', code: 'unauthorized' };
	}

	if (error instanceof errors.PaymentRequiredResponseError) {
		return {
			message: 'Insufficient credits. Please add credits to your OpenRouter account.',
			code: 'payment_required',
		};
	}

	if (error instanceof errors.TooManyRequestsResponseError) {
		// Access retryAfter from the nested error data if available
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const retryAfter = (error as any).retryAfter ?? (error as any).error?.retryAfter;
		return {
			message: retryAfter
				? `Rate limited. Retry after ${retryAfter} seconds.`
				: 'Rate limited. Please try again later.',
			code: 'rate_limited',
			retryAfter: retryAfter,
		};
	}

	if (error instanceof errors.InternalServerResponseError) {
		return { message: `OpenRouter server error: ${error.message}`, code: 'server_error' };
	}

	// Fallback for unknown errors
	if (error instanceof Error) {
		return { message: error.message, code: 'unknown_error' };
	}

	return { message: 'An unexpected error occurred', code: 'unknown_error' };
};

/**
 * Verifies an OpenRouter API key by making a minimal chat completion request.
 * This follows the best practice of actually testing the API rather than just format validation.
 */
export const verifyOpenRouterApiKey = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
	const client = createOpenRouterClient({
		apiKey,
		httpReferer: process.env.NEXT_PUBLIC_APP_BASE_URL,
		appTitle: 'Inngest Bot - Settings Verification',
	});

	try {
		// Make a minimal request to verify the API key works
		// SDK requires chatRequest wrapper for the parameters
		await client.chat.send({
			chatRequest: {
				model: 'openrouter/free', // Use a cheap, fast model for verification
				messages: [{ role: 'user', content: 'Hi' }],
				maxTokens: 5,
			},
		});

		return { success: true };
	} catch (error) {
		const { message } = handleOpenRouterError(error);
		return { success: false, error: message };
	}
};

/**
 * Model used for pro users when using the app's API key
 */
export const PRO_MODEL = 'deepseek/deepseek-v4-flash';

/**
 * Common OpenRouter model IDs for reference
 */
export const OPENROUTER_MODELS = {
	FREE: 'openrouter/free',
} as const;

export type OpenRouterModel = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS];
