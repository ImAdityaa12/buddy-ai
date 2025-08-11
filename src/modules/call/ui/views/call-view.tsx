'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';

interface CallViewProps {
    meetingId: string;
}

const CallView = ({ meetingId }: CallViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({
            id: meetingId,
        })
    );
    return <div>{JSON.stringify(data, null, 2)}</div>;
};

export default CallView;
