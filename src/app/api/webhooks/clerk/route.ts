import { NextResponse, type NextRequest } from 'next/server';

import { Webhook } from 'svix';

import { logAuditEvent } from '@/lib/audit';
import { db } from '@/lib/db';

/**
 * Clerk webhook handler for subscription and payment events
 * This handles pro plan upgrades/downgrades and resets usage accordingly
 */

// Webhook secret from environment
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

interface WebhookEvent {
	data: {
		email_addresses?: Array<{ email_address: string }>;
		first_name?: string;
		id: string;
		last_name?: string;
		organization?: {
			id: string;
			name: string;
		};
		plan?: string;
		status?: string;
	};
	event_attributes: {
		http_request: {
			client_ip: string;
			user_agent: string;
		};
	};
	object: 'event';
	timestamp: number;
	type: string;
}

export async function POST(req: NextRequest) {
	// Verify webhook secret is configured
	if (!WEBHOOK_SECRET) {
		console.error('CLERK_WEBHOOK_SECRET is not configured');
		return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
	}

	// Get headers
	const svixId = req.headers.get('svix-id');
	const svixTimestamp = req.headers.get('svix-timestamp');
	const svixSignature = req.headers.get('svix-signature');

	// Verify headers exist
	if (!svixId || !svixTimestamp || !svixSignature) {
		return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
	}

	// Get body
	const payload = await req.json();

	// Verify webhook signature
	let evt: WebhookEvent;
	try {
		const wh = new Webhook(WEBHOOK_SECRET);
		evt = wh.verify(JSON.stringify(payload), {
			'svix-id': svixId,
			'svix-signature': svixSignature,
			'svix-timestamp': svixTimestamp,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Webhook verification failed:', err);
		return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
	}

	const eventType = evt.type;
	const userId = evt.data.id;

	try {
		switch (eventType) {
			// User created - initialize usage record
			case 'user.created': {
				console.warn(`User created: ${userId}`);
				break;
			}

			// User deleted - cleanup usage data
			case 'user.deleted': {
				console.warn(`User deleted: ${userId}`);

				// Cleanup usage record
				await db.usage.deleteMany({
					where: { key: userId },
				});

				// Cleanup analytics
				await db.usageAnalytics.deleteMany({
					where: { userId },
				});

				// Log the deletion
				void logAuditEvent({
					action: 'AI_SETTINGS_DELETED' as const,
					details: { reason: 'user_deleted' },
					userId,
				});
				break;
			}

			// Organization created/updated - handle plan changes
			case 'organization.created':
			case 'organization.updated': {
				const plan = evt.data.plan;
				console.warn(`Organization ${eventType} for ${userId}: ${plan}`);

				if (plan === 'pro') {
					// Reset usage to give pro credits
					await db.usage.deleteMany({
						where: { key: userId },
					});

					// Initialize pro usage
					await db.usage.create({
						data: {
							expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
							key: userId,
							points: 100, // PRO_POINTS
						},
					});

					// Log the upgrade
					void logAuditEvent({
						action: 'PRO_UPGRADE' as const,
						details: {
							newPlan: plan,
							trigger: 'webhook',
						},
						userId,
					});

					console.warn(`Reset usage for pro user: ${userId}`);
				} else {
					// Reset to free tier
					await db.usage.deleteMany({
						where: { key: userId },
					});

					// Initialize free usage
					await db.usage.create({
						data: {
							expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
							key: userId,
							points: 5, // FREE_POINTS
						},
					});

					// Log the reset
					void logAuditEvent({
						action: 'CREDIT_RESET' as const,
						details: {
							newPlan: plan,
							reason: 'organization_update',
							trigger: 'webhook',
						},
						userId,
					});

					console.warn(`Reset usage for free user: ${userId}`);
				}
				break;
			}

			// Organization deleted - reset to free tier
			case 'organization.deleted': {
				console.warn(`Organization deleted for ${userId}`);

				// Reset to free tier
				await db.usage.deleteMany({
					where: { key: userId },
				});

				await db.usage.create({
					data: {
						expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
						key: userId,
						points: 5,
					},
				});
				break;
			}

			default: {
				console.warn(`Unhandled webhook event: ${eventType}`);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
	}
}
