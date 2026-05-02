/**
 * Simple in-memory cache with TTL support
 * Used for reducing database hits on frequently accessed data
 */

interface CacheEntry<T> {
	expiresAt: number;
	value: T;
}

class MemoryCache {
	private cache: Map<string, CacheEntry<unknown>> = new Map();

	/**
	 * Get a value from the cache
	 */
	get<T>(key: string): T | undefined {
		const entry = this.cache.get(key);

		if (!entry) return undefined;

		// Check if expired
		if (entry.expiresAt < Date.now()) {
			this.cache.delete(key);
			return undefined;
		}

		return entry.value as T;
	}

	/**
	 * Set a value in the cache with optional TTL (in seconds)
	 */
	set<T>(key: string, value: T, ttlSeconds = 60): void {
		this.cache.set(key, {
			expiresAt: Date.now() + ttlSeconds * 1000,
			value,
		});
	}

	/**
	 * Delete a value from the cache
	 */
	delete(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Clear all cached values
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache stats
	 */
	getStats(): { entries: number } {
		// Clean up expired entries first
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (entry.expiresAt < now) {
				this.cache.delete(key);
			}
		}

		return { entries: this.cache.size };
	}
}

// Singleton instance for the application
export const memoryCache = new MemoryCache();
