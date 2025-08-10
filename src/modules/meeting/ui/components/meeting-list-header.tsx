'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, XCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import NewMeetingDialog from './new-meeting-dialog';
import MeetingsSearchFilter from './meetings-search-filter';
import StatusFilters from './status-filters';
import AgentIdFilters from './agent-id-filter';
import { useMeetingFilters } from '../../hooks/use-meetings-filters';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DEFAULT_PAGE } from '@/constants';

const MeetingListHeader = () => {
    const [filter, setFilter] = useMeetingFilters();
    const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);

    const isAnyfilterModified =
        !!filter.agentId || !!filter.status || !!filter.search;

    const onClearFilters = () => {
        setFilter({
            agentId: '',
            status: null,
            search: '',
            page: DEFAULT_PAGE,
        });
    };

    return (
        <>
            <NewMeetingDialog
                open={meetingDialogOpen}
                onOpenChange={setMeetingDialogOpen}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Meetings</h5>
                    <Button
                        onClick={() => {
                            setMeetingDialogOpen(true);
                        }}
                    >
                        <PlusIcon />
                        New Meeting
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <MeetingsSearchFilter />
                        <StatusFilters />
                        <AgentIdFilters />
                        {isAnyfilterModified && (
                            <Button
                                onClick={onClearFilters}
                                disabled={!isAnyfilterModified}
                            >
                                <XCircleIcon />
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    );
};

export default MeetingListHeader;
