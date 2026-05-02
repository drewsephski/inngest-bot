import { Sandbox } from '@e2b/code-interpreter';
import type { AgentResult, TextMessage } from '@inngest/agent-kit';

import { SANDBOX_TIMEOUT } from '@/constants';

export async function getSandbox(sandboxId: string) {
	const sandbox = await Sandbox.connect(sandboxId);

	await sandbox.setTimeout(SANDBOX_TIMEOUT);
	return sandbox;
}

/**
 * Check if the dev server is running by making a request to localhost:3000
 * If not running, start it with `npm run dev`
 */
export async function ensureDevServerRunning(sandbox: Sandbox, maxRetries = 3): Promise<boolean> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// Try to check if something is listening on port 3000
			const result = await sandbox.commands.run(
				'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "failed"',
				{
					timeoutMs: 5000,
				}
			);

			if (result.stdout.includes('200') || result.stdout.includes('000')) {
				return true; // Server is responding
			}
		} catch {
			// Curl failed, server not running
		}

		// Try to start the dev server
		try {
			// Start dev server in background and don't wait for it
			sandbox.commands
				.run('npm run dev', {
					onStderr: () => {},
					onStdout: () => {},
				})
				.catch(() => {});

			// Wait a bit for the server to start
			await new Promise((resolve) => setTimeout(resolve, 3000));
		} catch {
			// Ignore errors from starting the server
		}
	}

	return false;
}

export function getLastAssistantTextMessageContent(result: AgentResult) {
	const lastAssistantTextMessageIndex = result.output.findLastIndex((message) => message.role === 'assistant');

	const message = result.output[lastAssistantTextMessageIndex] as TextMessage | undefined;

	return message?.content
		? typeof message.content === 'string'
			? message.content
			: message.content.map((c) => c.text).join('')
		: undefined;
}
