import LoadingState from '@/components/loading-state';
import { AgentsView } from '@/modules/agents/ui/views/agents-view';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { getQueryClient, trpc } from '../../../../trpc/server';

const page = () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agentsagain.queryOptions());

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
                <AgentsView />
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
