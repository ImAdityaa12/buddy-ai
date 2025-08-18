import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { TRPCReactProvider } from '@/trpc/client';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Buddy AI',
    description:
        'Empowering individuals and teams to elevate their conversational intelligence and productivity.',
    icons: {
        icon: '/logo.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NuqsAdapter>
            <TRPCReactProvider>
                <html lang="en" suppressHydrationWarning>
                    <body className={`${inter.className} antialiased`}>
                        {' '}
                        <Toaster />
                        {children}
                    </body>
                </html>
            </TRPCReactProvider>
        </NuqsAdapter>
    );
}
