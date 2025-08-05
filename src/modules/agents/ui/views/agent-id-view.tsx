'use client';

import { useTRPC } from '@/trpc/client';
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import React, { useState } from 'react';
import AgentIdViewHeader from '../components/agent-id-view-header';
import { GeneratedAvatar } from '@/components/generated-avatar';
import { Badge } from '@/components/ui/badge';
import { VideoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import UpdateAgentDialog from '../components/upate-agent-dialog';

interface AgentIdViewProps {
    agentId: string;
}

const AgentIdView = ({ agentId }: AgentIdViewProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

    const { data } = useSuspenseQuery(
        trpc.agents.getOne.queryOptions({
            id: agentId,
        })
    );

    const removeAgent = useMutation(
        trpc.agents.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions({})
                );
                //TODO: Invalidate free tier usage
                router.push('/agents');
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const [RemoveConfirmationDialog, confirmRemove] = useConfirm(
        'Are You Sure?',
        `The following action will remove ${1}(data.meetingCount) associated meetings`
    );

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();

        if (!ok) {
            return;
        }
        await removeAgent.mutateAsync({
            id: agentId,
        });
    };

    return (
        <>
            <RemoveConfirmationDialog />
            <UpdateAgentDialog
                open={updateAgentDialogOpen}
                onOpenChange={setUpdateAgentDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <AgentIdViewHeader
                    agentId={agentId}
                    agentName={data.name}
                    onEdit={() => setUpdateAgentDialogOpen(true)}
                    onRemove={() => handleRemoveAgent()}
                />
                <div className="bg-white rounded-lg border">
                    <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                        <GeneratedAvatar
                            variant="bottsNeutral"
                            seed={data.name}
                            className="size-10"
                        />
                        <h2 className="text-2xl font-medium">{data.name}</h2>
                        <Badge
                            variant={'outline'}
                            className="flex items-center gap-x-2 [&>svg]:size-4"
                        >
                            <VideoIcon className="text-blue-700" />
                            {/* {data.meetingCount} */}
                        </Badge>
                        <div className="flex flex-col gap-y-4">
                            <p className="text-lg font-medium">Instructions</p>
                            <p className="text-neutral-800">
                                {data.instructions}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgentIdView;
