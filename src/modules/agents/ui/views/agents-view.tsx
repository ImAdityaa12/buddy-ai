'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../../../../../trpc/client';

export const AgentsView = () => {
    const trpc = useTRPC();
    const { data } = useQuery(trpc.agentsagain.queryOptions());

    return <div>{JSON.stringify(data, null, 2)}</div>;
};
