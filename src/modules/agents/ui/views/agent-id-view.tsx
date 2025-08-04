'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';

interface AgentIdViewProps {
    agentId: string;
}

const AgentIdView = ({ agentId }: AgentIdViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(
        trpc.agents.getOne.queryOptions({
            id: agentId,
        })
    );
    return (
        <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
            {JSON.stringify(data, null, 2)}
        </div>
    );
};

export default AgentIdView;
