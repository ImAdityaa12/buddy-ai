'use client';

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
            <div>
                <p>Error loading agents</p>
            </div>
        );
    }
    return <div>{JSON.stringify(agents, null, 2)}</div>;
};
