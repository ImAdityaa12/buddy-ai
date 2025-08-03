'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, XCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import NewAgentDialog from './new-agent-dialog';
import AgentSearchFilters from './agent-search-filter';
import { useAgentsFilters } from '../../hooks/use-agents-filters';
import { DEFAULT_PAGE } from '@/constants';

const AgentListHeader = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useAgentsFilters();

    const isAnyFilterModified = !!filters.search;

    const onClearFilters = () => {
        setFilters({
            search: '',
            page: DEFAULT_PAGE,
        });
    };

    return (
        <>
            <NewAgentDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Agent
                    </Button>
                </div>
                <div className="flex items-ceter gap-x-2 p-1">
                    <AgentSearchFilters />
                    {isAnyFilterModified && (
                        <Button variant={'outline'} onClick={onClearFilters}>
                            <XCircleIcon />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default AgentListHeader;
