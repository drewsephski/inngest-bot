import type { Message } from '@inngest/agent-kit';
import { clsx, type ClassValue } from 'clsx';
import { APIError, AuthenticationError, OpenAIError, RateLimitError } from 'openai';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env/client';
import type { TreeItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const absoluteUrl = (path: string): string => {
	const formattedPath = path.trim();
	if (formattedPath.startsWith('http')) return formattedPath;

	let baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;

	const vercelUrl = env.NEXT_PUBLIC_VERCEL_URL;
	const vercelEnv = env.NEXT_PUBLIC_VERCEL_ENV;

	if (!!vercelEnv && vercelEnv === 'preview' && !!vercelUrl) baseUrl = `https://${vercelUrl}`;

	return `${baseUrl}${formattedPath.startsWith('/') ? '' : '/'}${formattedPath}`;
};

export const getLanguageFromExtension = (filename: string): string => {
	const extension = filename.split('.').pop()?.toLowerCase();

	return extension || 'text';
};

/**
 * Converts a record of files to a tree structure.
 * @param files - The record of file paths to content.
 * @returns The tree structure for TreeView component.
 * @example
 * Input: { 'src/Button.tsx': '...', 'README.md': '...' }
 * Output: [['src', 'Button.tsx'], ['README.md']]
 */
export const convertFilesToTreeItems = (files: { [path: string]: string }): TreeItem[] => {
	interface TreeNode {
		[key: string]: TreeNode | null;
	}

	const tree: TreeNode = {};
	const sortedPaths = Object.keys(files).sort();

	for (const filePath of sortedPaths) {
		const parts = filePath.split('/');
		let current = tree;

		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!current[part]) current[part] = {};

			current = current[part];
		}

		const fileName = parts[parts.length - 1];
		current[fileName] = null;
	}

	function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
		const entries = Object.entries(node);

		if (entries.length === 0) return name || '';

		const children: TreeItem[] = [];

		for (const [key, value] of entries) {
			if (value === null) children.push(key);
			else {
				// This is a folder
				const subTree = convertNode(value, key);

				if (Array.isArray(subTree)) children.push([key, ...subTree]);
				else children.push([key, subTree]);
			}
		}

		return children;
	}

	const result = convertNode(tree);

	return Array.isArray(result) ? result : [result];
};

interface GenerateTextFromMessageProps {
	defaultText: string;
	message: Message;
}

export const generateTextFromMessage = ({ defaultText, message }: GenerateTextFromMessageProps): string => {
	if (message.type !== 'text') return defaultText;

	if (Array.isArray(message.content)) return message.content.join(' ');

	return message.content;
};

export const getAISettingsErrorMessage = (error: unknown): string => {
	if (error instanceof AuthenticationError || (error instanceof APIError && error.status === 401)) {
		return 'Invalid API key. Please check your key and try again';
	}

	if (error instanceof RateLimitError || (error instanceof APIError && error.status === 429)) {
		const code = error instanceof APIError ? error.code : null;
		const message = error instanceof Error ? error.message : '';
		const isQuota =
			code === 'insufficient_quota' || /insufficient_quota|exceeded your current quota|quota|billing/i.test(message);

		if (isQuota) return 'Not enough credits. Please purchase more credits and try again';

		return 'Rate limit reached. Please try again in a moment';
	}

	if (error instanceof OpenAIError) return error.message || 'Failed to verify API key';

	if (error instanceof Error) return error.message;

	return 'Failed to verify API key';
};

/**
 * Gets error message for OpenRouter-specific errors.
 * Use this when handling errors from OpenRouter SDK directly.
 */
export const getOpenRouterErrorMessage = (error: { message: string; code: string }): string => {
	switch (error.code) {
		case 'unauthorized':
			return 'Invalid OpenRouter API key. Please check your key and try again';
		case 'payment_required':
			return 'Not enough credits in your OpenRouter account. Please add credits and try again';
		case 'rate_limited':
			return 'OpenRouter rate limit reached. Please try again in a moment';
		case 'bad_request':
			return `Invalid request: ${error.message}`;
		case 'server_error':
			return 'OpenRouter server error. Please try again later';
		default:
			return error.message || 'Failed to verify OpenRouter API key';
	}
};

/**
 * Validates and sanitizes an external URL to prevent open redirect vulnerabilities
 * @param url - The URL to validate
 * @param allowedDomains - Optional array of allowed domains (defaults to common social platforms)
 * @returns The sanitized URL if valid, null otherwise
 */
export const validateExternalUrl = (
	url: string,
	allowedDomains?: string[]
): string | null => {
	try {
		const parsed = new URL(url);

		// Only allow http and https protocols
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			return null;
		}

		// Default allowed domains for social/external links
		const defaultAllowedDomains = [
			'instagram.com',
			'www.instagram.com',
			'twitter.com',
			'x.com',
			'github.com',
			'linkedin.com',
			'www.linkedin.com',
			'youtube.com',
			'www.youtube.com',
		];

		const domains = allowedDomains ?? defaultAllowedDomains;

		// Check if the hostname is in the allowed list
		const isAllowed = domains.some(
			(domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
		);

		if (!isAllowed) {
			return null;
		}

		// Return the URL with protocol and hostname (removes any username/password)
		return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return null;
	}
};

/**
 * Creates a safe external link object with all security attributes
 * @param url - The external URL
 * @param allowedDomains - Optional array of allowed domains
 * @returns Object with safe URL and link attributes, or null if invalid
 */
export const createSafeExternalLink = (
	url: string,
	allowedDomains?: string[]
): { href: string; target: string; rel: string } | null => {
	const validatedUrl = validateExternalUrl(url, allowedDomains);
	if (!validatedUrl) return null;

	return {
		href: validatedUrl,
		rel: 'noopener noreferrer',
		target: '_blank',
	};
};
