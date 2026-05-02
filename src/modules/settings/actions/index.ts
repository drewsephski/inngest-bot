'use server';

import { OpenAI } from 'openai';

import type { AIProvider } from '@/generated/prisma/enums';
import { verifyOpenRouterApiKey } from '@/lib/openrouter';
import { getAISettingsErrorMessage } from '@/lib/utils';

const verifyOpenAISettings = async (apiKey: string) => {
	const openai = new OpenAI({
		apiKey,
	});

	// Verify API key and that account has credits by sending a minimal chat request
	const completion = await openai.chat.completions.create({
		max_completion_tokens: 5, // eslint-disable-line camelcase -- OpenAI API parameter
		messages: [{ content: 'hi', role: 'user' }],
		model: 'gpt-4o-mini',
	});

	if (!completion.choices[0]?.message?.content) throw new Error('No response from API');

	return true;
};

const verifyOpenRouterSettings = async (apiKey: string) => {
	// Format validation first
	if (!apiKey.startsWith('sk-or-')) {
		throw new Error('Invalid OpenRouter API key format. Must start with sk-or-');
	}

	if (apiKey.length < 20) {
		throw new Error('Invalid OpenRouter API key. Too short');
	}

	// Use the proper OpenRouter SDK for API verification
	const result = await verifyOpenRouterApiKey(apiKey);

	if (!result.success) {
		throw new Error(result.error || 'Failed to verify OpenRouter API key');
	}

	return true;
};

export const verifyAISettings = async (apiKey: string, provider: AIProvider) => {
	try {
		if (provider === 'OPENROUTER') {
			await verifyOpenRouterSettings(apiKey);
		} else {
			await verifyOpenAISettings(apiKey);
		}

		return { error: null, success: true };
	} catch (error) {
		return { error: getAISettingsErrorMessage(error), success: false };
	}
};
