'use client';

import Link from 'next/link';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { CrownIcon, ZapIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';

export const CreditsBadge = () => {
	const { has } = useAuth();
	const trpc = useTRPC();
	const hasProAccess = has?.({ plan: 'pro' }) || false;

	const { data: usage } = useQuery(trpc.usage.status.queryOptions());

	const points = usage?.remainingPoints ?? 0;

	if (!has) return null;

	return (
		<div className='flex items-center gap-2'>
			<div className='bg-background flex items-center gap-1.5 rounded-full border px-3 py-1.5'>
				<ZapIcon className='h-3.5 w-3.5 text-yellow-500' />
				<span className='text-sm font-medium'>
					{points} {hasProAccess ? 'Pro' : 'Free'} Credits
				</span>
				{hasProAccess && <CrownIcon className='h-3.5 w-3.5 text-blue-500' />}
			</div>

			{!hasProAccess && (
				<Button size='sm' variant='ghost' className='h-8 gap-1 px-2 text-xs' asChild>
					<Link href='/pricing'>
						<CrownIcon className='h-3.5 w-3.5 text-blue-500' />
						Upgrade
					</Link>
				</Button>
			)}
		</div>
	);
};
