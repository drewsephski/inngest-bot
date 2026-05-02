import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '@/env/server';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Connection pool configuration for serverless environments
// These settings optimize for Vercel's serverless functions
const POOL_CONFIG = {
	// Maximum milliseconds to wait for a connection from the pool
	connectionTimeoutMillis: 5000,
	// Maximum milliseconds a client can be idle before being closed
	idleTimeoutMillis: 30000,
	// Maximum number of connections in the pool
	max: 20,
	// Minimum number of connections to maintain
	min: 2,
};

// Parse connection string and add pooling parameters
const buildConnectionString = (baseUrl: string) => {
	const url = new URL(baseUrl);
	// Add pool configuration as query parameters
	url.searchParams.set('connection_limit', String(POOL_CONFIG.max));
	url.searchParams.set('pool_timeout', String(POOL_CONFIG.connectionTimeoutMillis / 1000));
	return url.toString();
};

const createPrismaClient = () => {
	const connectionString = buildConnectionString(env.DATABASE_URL);

	const client = new PrismaClient({
		adapter: new PrismaPg({ connectionString }),
		log:
			env.NODE_ENV === 'development'
				? [
						{ emit: 'stdout', level: 'query' },
						{ emit: 'stdout', level: 'error' },
						{ emit: 'stdout', level: 'warn' },
					]
				: [{ emit: 'stdout', level: 'error' }],
	});

	return client;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

// Graceful shutdown helper
export const disconnectDb = async () => {
	await prisma.$disconnect();
};

// Health check helper
export const checkDbHealth = async (): Promise<{ healthy: boolean; latency: number; error?: string }> => {
	const start = performance.now();
	try {
		await prisma.$queryRaw`SELECT 1`;
		const latency = performance.now() - start;
		return { healthy: true, latency };
	} catch (error) {
		const latency = performance.now() - start;
		return {
			error: error instanceof Error ? error.message : 'Unknown database error',
			healthy: false,
			latency,
		};
	}
};
