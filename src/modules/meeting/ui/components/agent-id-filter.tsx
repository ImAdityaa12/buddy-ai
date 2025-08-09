import React, { useState } from 'react';
import { useMeetingFilters } from '../../hooks/use-meetings-filters';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import CommandSelect from '@/components/command-select';
import { GeneratedAvatar } from '@/components/generated-avatar';

const AgentIdFilters = () => {
    const [filters, setFilters] = useMeetingFilters();
    const trpc = useTRPC();
    const [agentSearch, setAgentSearch] = useState('');

    const { data } = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        })
    );

    return (
        <CommandSelect
            className="h-9"
            placeholder="Agent"
            options={(data?.items ?? []).map((item) => ({
                id: item.id,
                value: item.id,
                children: (
                    <div className="flex items-center gap-x-2">
                        <GeneratedAvatar
                            seed={item.name}
                            variant="bottsNeutral"
                            className="size-4"
                        />
                        {item.name}
                    </div>
                ),
            }))}
            onSelect={(value) => setFilters({ agentId: value })}
            value={filters.agentId}
            onSearch={setAgentSearch}
        />
    );
};

export default AgentIdFilters;
