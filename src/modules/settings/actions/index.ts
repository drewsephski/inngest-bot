'use server';

import { OpenRouter } from '@openrouter/sdk';
import { OpenAI } from 'openai';

import type { AIProvider } from '@/generated/prisma/enums';
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
	const client = new OpenRouter({
		apiKey,
	});

	// Verify API key by sending a minimal chat request using a free model
	const result = await client.chat.send({
		chatRequest: {
			maxTokens: 5,
			messages: [{ content: 'hi', role: 'user' }],
			model: 'openai/gpt-4o-mini',
		},
	});

	if (!result.choices?.[0]?.message?.content) throw new Error('No response from OpenRouter API');

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
