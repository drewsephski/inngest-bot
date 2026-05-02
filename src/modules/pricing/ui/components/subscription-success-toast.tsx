'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

/**
 * Component that detects subscription success and shows a toast notification.
 * Works on any page where it's mounted - detects both:
 * 1. Query param `?subscribed=success` from redirect after checkout
 * 2. Plan status change when user gains Pro access
 */
export const SubscriptionSuccessToast = () => {
	const { has } = useAuth();
	const hasProAccess = has?.({ plan: 'pro' }) || false;
	const hadProAccessRef = useRef(hasProAccess);
	const searchParams = useSearchParams();
	const hasShownToastRef = useRef(false);

	// Check for subscribed query param (from redirect after checkout)
	useEffect(() => {
		const subscribed = searchParams.get('subscribed');
		if (subscribed === 'success' && !hasShownToastRef.current) {
			hasShownToastRef.current = true;
			toast.success('Successfully subscribed! Your Pro credits will be added to your account shortly.');

			// Clean up the URL
			const url = new URL(window.location.href);
			url.searchParams.delete('subscribed');
			window.history.replaceState({}, '', url.toString());
		}
	}, [searchParams]);

	// Track initial pro status
	useEffect(() => {
		hadProAccessRef.current = hasProAccess;
	}, [hasProAccess]);

	return null;
};
