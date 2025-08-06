import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const MeetingsView = () => {
    const trpc = useTRPC();
    const { data } = useQuery(trpc.meetings.getMany.queryOptions({}));
    return <div>{JSON.stringify(data)}</div>;
};

export default MeetingsView;
