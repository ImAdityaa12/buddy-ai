'use client';

import React, { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GavelIcon, Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DecisionsProps {
    meetingId: string;
}

const Decisions = ({ meetingId }: DecisionsProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [newDecision, setNewDecision] = useState('');

    const queryOptions = trpc.meetings.getDecisions.queryOptions({
        meetingId,
    });
    const { data: decisions = [], isLoading } = useQuery(queryOptions);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });

    const add = useMutation(
        trpc.meetings.addDecision.mutationOptions({
            onSuccess: () => {
                setNewDecision('');
                invalidate();
            },
            onError: () => toast.error('Failed to add decision'),
        })
    );

    const remove = useMutation(
        trpc.meetings.removeDecision.mutationOptions({
            onSuccess: () => invalidate(),
            onError: () => toast.error('Failed to remove decision'),
        })
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const decision = newDecision.trim();
        if (!decision) return;
        add.mutate({ meetingId, decision });
    };

    return (
        <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <GavelIcon className="size-4" />
                    <p className="text-sm font-medium">Decisions</p>
                </div>
                {decisions.length > 0 && (
                    <Badge variant="outline">
                        {decisions.length}{' '}
                        {decisions.length === 1 ? 'decision' : 'decisions'}
                    </Badge>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2Icon className="size-5 animate-spin" />
                </div>
            ) : decisions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                    No decisions were captured for this meeting. Add one below.
                </p>
            ) : (
                <div className="flex flex-col gap-y-2">
                    {decisions.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-start gap-x-3 rounded-md border p-3 hover:bg-muted/50"
                        >
                            <div className="flex flex-col gap-y-1 flex-1">
                                <p className="text-sm font-medium">
                                    {item.decision}
                                </p>
                                {item.context && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.context}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                disabled={remove.isPending}
                                onClick={() => remove.mutate({ id: item.id })}
                            >
                                <Trash2Icon className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleAdd} className="flex items-center gap-x-2">
                <Input
                    placeholder="Add a decision…"
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    className="h-9"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={add.isPending || newDecision.trim().length === 0}
                >
                    {add.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <PlusIcon className="size-4" />
                    )}
                    Add
                </Button>
            </form>
        </div>
    );
};

export default Decisions;
