import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import AgentListHeader from '@/modules/agents/ui/components/agent-list-header';
import { AgentsView } from '@/modules/agents/ui/views/agents-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect('/sign-in');
    }
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({}));

    return (
        <>
            <AgentListHeader />
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
        </>
    );
};

export default page;
