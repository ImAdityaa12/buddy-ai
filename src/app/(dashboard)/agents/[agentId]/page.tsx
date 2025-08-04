import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import AgentIdView from '@/modules/agents/ui/views/agent-id-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{ agentId: string }>;
}

const page = async ({ params }: Props) => {
    const { agentId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.agents.getOne.queryOptions({
            id: agentId,
        })
    );
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={
                    <LoadingState
                        title="Loading agents"
                        description="Loading agents"
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
                    <AgentIdView agentId={agentId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
