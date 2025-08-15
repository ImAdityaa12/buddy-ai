import { getQueryClient, trpc } from '@/trpc/server';
import React, { Suspense } from 'react';
import { auth } from '../../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingState from '@/components/loading-state';
import ErrorState from '@/components/error-state';

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/sign-in');
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.premium.getCurrentSubscripton.queryOptions()
    );
    void queryClient.prefetchQuery(trpc.premium.getProducts.queryOptions());
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={
                    <LoadingState
                        title="Loading"
                        description="We are loading your products. This may take a moment."
                    />
                }
            >
                <ErrorBoundary
                    fallback={
                        <ErrorState
                            title="Error"
                            description="We are having trouble loading your products. Please try again."
                        />
                    }
                >
                    page
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
