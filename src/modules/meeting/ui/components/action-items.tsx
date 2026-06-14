'use client';

import React, { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    CalendarIcon,
    ListTodoIcon,
    Loader2Icon,
    PlusIcon,
    Trash2Icon,
    UserIcon,
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActionItemsProps {
    meetingId: string;
}

const ActionItems = ({ meetingId }: ActionItemsProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [newTask, setNewTask] = useState('');

    const queryOptions = trpc.meetings.getActionItems.queryOptions({
        meetingId,
    });
    const { data: actionItems = [], isLoading } = useQuery(queryOptions);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });

    const toggle = useMutation(
        trpc.meetings.toggleActionItem.mutationOptions({
            onSuccess: () => invalidate(),
            onError: () => toast.error('Failed to update action item'),
        })
    );

    const add = useMutation(
        trpc.meetings.addActionItem.mutationOptions({
            onSuccess: () => {
                setNewTask('');
                invalidate();
            },
            onError: () => toast.error('Failed to add action item'),
        })
    );

    const remove = useMutation(
        trpc.meetings.removeActionItem.mutationOptions({
            onSuccess: () => invalidate(),
            onError: () => toast.error('Failed to remove action item'),
        })
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const task = newTask.trim();
        if (!task) return;
        add.mutate({ meetingId, task });
    };

    const completedCount = actionItems.filter((i) => i.completed).length;

    return (
        <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ListTodoIcon className="size-4" />
                    <p className="text-sm font-medium">Action Items</p>
                </div>
                {actionItems.length > 0 && (
                    <Badge variant="outline">
                        {completedCount}/{actionItems.length} done
                    </Badge>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2Icon className="size-5 animate-spin" />
                </div>
            ) : actionItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                    No action items were found for this meeting. Add one below.
                </p>
            ) : (
                <div className="flex flex-col gap-y-2">
                    {actionItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-start gap-x-3 rounded-md border p-3 hover:bg-muted/50"
                        >
                            <Checkbox
                                className="mt-0.5"
                                checked={item.completed}
                                disabled={toggle.isPending}
                                onCheckedChange={(checked) =>
                                    toggle.mutate({
                                        id: item.id,
                                        completed: checked === true,
                                    })
                                }
                            />
                            <div className="flex flex-col gap-y-1 flex-1">
                                <p
                                    className={cn(
                                        'text-sm',
                                        item.completed &&
                                            'line-through text-muted-foreground'
                                    )}
                                >
                                    {item.task}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {item.owner && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-x-1 [&>svg]:size-3"
                                        >
                                            <UserIcon />
                                            {item.owner}
                                        </Badge>
                                    )}
                                    {item.dueDate && (
                                        <Badge
                                            variant="outline"
                                            className="gap-x-1 [&>svg]:size-3"
                                        >
                                            <CalendarIcon />
                                            {item.dueDate}
                                        </Badge>
                                    )}
                                </div>
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
                    placeholder="Add an action item…"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="h-9"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={add.isPending || newTask.trim().length === 0}
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

export default ActionItems;
