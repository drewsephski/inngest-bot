import { Suspense, type PropsWithChildren } from 'react';

import { ClerkProvider, GoogleOneTap } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';

import { SubscriptionSuccessToast } from '@/modules/pricing/ui/components/subscription-success-toast';

import { TRPCReactProvider } from '@/trpc/client';

import { ModalProvider } from './modal-provider';
import { ToasterProvider } from './toaster-provider';

export const Providers = ({ children }: Readonly<PropsWithChildren>) => {
	return (
		<ClerkProvider
			afterSignOutUrl='/'
			appearance={{
				variables: {
					colorPrimary: '#C96342',
				},
			}}
		>
			<TRPCReactProvider>
				<ThemeProvider
					attribute='class'
					storageKey='vibe-theme'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					{children}

					<ModalProvider />
					<ToasterProvider />
					<Suspense>
						<SubscriptionSuccessToast />
					</Suspense>
					<GoogleOneTap />
				</ThemeProvider>
			</TRPCReactProvider>
		</ClerkProvider>
	);
};
