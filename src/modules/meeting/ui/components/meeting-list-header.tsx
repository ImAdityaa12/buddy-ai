'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import NewMeetingDialog from './new-meeting-dialog';

const MeetingListHeader = () => {
    const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
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
                <div className="flex items-ceter gap-x-2 p-1"></div>
            </div>
        </>
    );
};

export default MeetingListHeader;
