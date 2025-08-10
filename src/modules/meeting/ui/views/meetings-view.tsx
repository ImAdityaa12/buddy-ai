'use client';

import { DataTable } from '@/components/data-table';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';
import DataPagination from '@/modules/agents/ui/components/data-pagination';
import { useMeetingFilters } from '../../hooks/use-meetings-filters';
import { useRouter } from 'next/navigation';

const MeetingsView = () => {
    const router = useRouter();
    const [filters, setFilters] = useMeetingFilters();
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(
        trpc.meetings.getMany.queryOptions({
            ...filters,
        })
    );
    return (
        <div className="p-4">
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(item) => {
                    router.push(`/meetings/${item.id}`);
                }}
            />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => {
                    setFilters({
                        page,
                    });
                }}
            />
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
