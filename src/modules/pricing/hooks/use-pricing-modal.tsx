'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { create } from 'zustand';

import { PricingView } from '@/modules/pricing/ui/views/pricing-view';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PricingModalState {
	close: () => void;
	isOpen: boolean;
	open: () => void;
}

export const usePricingModal = create<PricingModalState>((set) => ({
	close: () => set({ isOpen: false }),
	isOpen: false,
	open: () => set({ isOpen: true }),
}));

export const PricingModal = () => {
	const { isOpen, close } = usePricingModal();
	const { has } = useAuth();
	const hasProAccess = has?.({ plan: 'pro' }) || false;
	const hadProAccessRef = useRef(hasProAccess);

	// Track pro status when modal opens
	useEffect(() => {
		if (isOpen) {
			hadProAccessRef.current = hasProAccess;
		}
	}, [isOpen, hasProAccess]);

	// Handle modal close - check if user just upgraded
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// If user didn't have pro before but has it now, show success toast
			if (!hadProAccessRef.current && hasProAccess) {
				toast.success('Successfully subscribed! Your Pro credits will be added to your account shortly.');
			}
			close();
		}
	};

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='max-w-3xl'>
				<DialogHeader>
					<DialogTitle>Upgrade to Continue</DialogTitle>
					<DialogDescription>
						You&apos;ve run out of credits. Subscribe to a plan to get more credits and continue building.
					</DialogDescription>
				</DialogHeader>
				<PricingView />
			</DialogContent>
		</Dialog>
	);
};
