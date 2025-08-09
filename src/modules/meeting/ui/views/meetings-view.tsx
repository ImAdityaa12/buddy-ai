'use client';

import { DataTable } from '@/components/data-table';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';

const MeetingsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));
    return (
        <div className="p-4">
            <DataTable data={data.items} columns={columns} />
            {data.items.length === 0 && (
                <EmptyState
                    title="Create your first meeting"
                    description="Create a meeting to join with your team."
                />
            )}
        </div>
    );
};

export default MeetingsView;
