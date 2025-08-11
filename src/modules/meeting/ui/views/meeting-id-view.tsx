'use client';

import { useTRPC } from '@/trpc/client';
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import React, { useState } from 'react';
import MeetingIdViewHeader from '../components/meeting-id-view-header';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import UpdateMeetingDialog from '../components/update-meeting-dialog';

interface MeetingIdViewProps {
    meetingId: string;
}

const MeetingIdView = ({ meetingId }: MeetingIdViewProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [openMeetingEditDialog, setOpenMeetingEditDialog] = useState(false);
    const [RemoveConfirmation, confirmRemove] = useConfirm(
        'Are you sure?',
        'The following action will remove this meeting'
    );
    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({
            id: meetingId,
        })
    );

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );
                router.push('/meetings');
            },
            onError: () => {
                toast.error('Failed to remove meeting');
            },
        })
    );
    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();
        if (!ok) {
            return;
        }

        await removeMeeting.mutateAsync({
            id: meetingId,
        });
    };
    return (
        <>
            <UpdateMeetingDialog
                open={openMeetingEditDialog}
                onOpenChange={setOpenMeetingEditDialog}
                initialValues={data}
            />
            <RemoveConfirmation />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={data.id}
                    meetingName={data.name}
                    onEdit={() => {
                        setOpenMeetingEditDialog(true);
                    }}
                    onRemove={handleRemoveMeeting}
                />
            </div>
        </>
    );
};

export default MeetingIdView;
