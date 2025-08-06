import React from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { meetingsUpdateSchema } from '../../schema';
import { MeetingGetOne } from '../../types';

interface MeetingFormProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: MeetingFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );
                // TODO: Invalidate free tier usage
                onSuccess?.(data.id);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({
                            id: initialValues.id,
                        })
                    );
                }
                onSuccess?.(data.id);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );
    const form = useForm<z.infer<typeof meetingsUpdateSchema>>({
        resolver: zodResolver(meetingsUpdateSchema),
        defaultValues: {
            name: initialValues?.name || '',
            agentId: initialValues?.agentId || '',
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = async (values: z.infer<typeof meetingsUpdateSchema>) => {
        if (isEdit) {
            updateMeeting.mutate({
                ...values,
                id: initialValues.id,
            });
        } else {
            createMeeting.mutate(values);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g Trying to improve my coding skills!"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                            variant={'ghost'}
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button disabled={isPending} type="submit">
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default MeetingForm;
