'use client';

import { useEffect, useState } from 'react';

import { PricingModal } from '@/modules/pricing/hooks/use-pricing-modal';
import { RenameProjectModal } from '@/modules/projects/ui/components/rename-project-modal';
import { SettingsModal } from '@/components/settings-modal';

export const ModalProvider = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<>
			<SettingsModal />
			<RenameProjectModal />
			<PricingModal />
		</>
	);
};
