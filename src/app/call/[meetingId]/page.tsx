import React, { Suspense } from 'react';
import { auth } from '../../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import CallView from '@/modules/call/ui/views/call-view';

interface Props {
    params: Promise<{
        meetingId: string;
    }>;
}

const page = async ({ params }: Props) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/sign-in');
    }

    const { meetingId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getOne.queryOptions({
            id: meetingId,
        })
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={
                    <LoadingState
                        title="Loading meeting"
                        description="Please wait while we load the meeting."
                    />
                }
            >
                <ErrorBoundary
                    fallback={
                        <ErrorState
                            title="Meeting not found"
                            description="The meeting you are trying to join does not exist."
                        />
                    }
                >
                    <CallView meetingId={meetingId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
