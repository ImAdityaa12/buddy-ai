import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { AgentsView } from '@/modules/agents/ui/views/agents-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
const page = () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={
                    <LoadingState
                        title="Loading agents"
                        description="We are loading your agents. Please wait."
                    />
                }
            >
                <ErrorBoundary
                    fallback={
                        <ErrorState
                            title="Error loading agents"
                            description="We were unable to load your agents. Please try again later."
                        />
                    }
                >
                    <AgentsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
