'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export const AgentsView = () => {
    const trpc = useTRPC();
    const {
        data: agents,
        isLoading,
        isError,
    } = useQuery(trpc.agents.getMany.queryOptions());

    if (isLoading) {
        return (
            <LoadingState
                title="Loading agents"
                description="We are loading your agents. Please wait."
            />
        );
    }
    if (isError) {
        return (
            <ErrorState
                title="Error loading agents"
                description="We were unable to load your agents. Please try again later."
            />
        );
    }
    return <div>{JSON.stringify(agents, null, 2)}</div>;
};
