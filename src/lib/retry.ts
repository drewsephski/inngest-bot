/**
 * Retry utility with exponential backoff for external API calls
 */

interface RetryOptions {
	/** Maximum number of retry attempts */
	maxRetries?: number;
	/** Initial delay in milliseconds */
	initialDelayMs?: number;
	/** Maximum delay in milliseconds */
	maxDelayMs?: number;
	/** Multiplier for exponential backoff */
	backoffMultiplier?: number;
	/** Function to determine if an error is retryable */
	isRetryable?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	backoffMultiplier: 2,
	initialDelayMs: 1000,
	isRetryable: () => true,
	maxDelayMs: 30000,
	maxRetries: 3,
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let lastError: unknown;

	for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Don't retry on the last attempt
			if (attempt === opts.maxRetries) break;

			// Check if error is retryable
			if (!opts.isRetryable(error)) {
				throw error;
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt), opts.maxDelayMs);

			console.warn(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms due to:`, error);
			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Check if an OpenAI/OpenRouter error is retryable
 */
export const isAIRetryableError = (error: unknown): boolean => {
	if (error instanceof Error) {
		// Rate limit errors are retryable
		if (error.message.includes('429') || error.message.includes('rate limit')) {
			return true;
		}
		// Server errors are retryable
		if (error.message.includes('5') || error.message.includes('server error')) {
			return true;
		}
		// Timeout errors are retryable
		if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
			return true;
		}
	}
	return false;
};

/**
 * Circuit breaker pattern for protecting external services
 */
interface CircuitBreakerOptions {
	/** Number of failures before opening the circuit */
	failureThreshold?: number;
	/** Time in milliseconds before attempting to close the circuit */
	resetTimeoutMs?: number;
}

enum CircuitState {
	CLOSED = 'CLOSED',
	HALF_OPEN = 'HALF_OPEN',
	OPEN = 'OPEN',
}

export class CircuitBreaker {
	private failures = 0;
	private lastFailureTime?: number;
	private state: CircuitState = CircuitState.CLOSED;

	private readonly failureThreshold: number;
	private readonly resetTimeoutMs: number;

	constructor(options: CircuitBreakerOptions = {}) {
		this.failureThreshold = options.failureThreshold ?? 5;
		this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
	}

	async execute<T>(fn: () => Promise<T>): Promise<T> {
		// Check if we should transition from OPEN to HALF_OPEN
		if (this.state === CircuitState.OPEN) {
			if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
				this.state = CircuitState.HALF_OPEN;
				console.warn('Circuit breaker entering HALF_OPEN state');
			} else {
				throw new CircuitBreakerError('Circuit breaker is OPEN - service temporarily unavailable');
			}
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onSuccess(): void {
		if (this.state === CircuitState.HALF_OPEN) {
			// Successfully executed while half-open, close the circuit
			this.state = CircuitState.CLOSED;
			this.failures = 0;
			console.warn('Circuit breaker CLOSED - service recovered');
		}
	}

	private onFailure(): void {
		this.failures += 1;
		this.lastFailureTime = Date.now();

		if (this.failures >= this.failureThreshold || this.state === CircuitState.HALF_OPEN) {
			this.state = CircuitState.OPEN;
			console.warn(`Circuit breaker OPENED after ${this.failures} failures`);
		}
	}

	getState(): CircuitState {
		return this.state;
	}
}

export class CircuitBreakerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CircuitBreakerError';
	}
}

// Circuit breaker instances for different external services
export const openAICircuitBreaker = new CircuitBreaker({
	failureThreshold: 5,
	resetTimeoutMs: 30000,
});

export const openRouterCircuitBreaker = new CircuitBreaker({
	failureThreshold: 5,
	resetTimeoutMs: 30000,
});
