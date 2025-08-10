import React, { Suspense } from 'react';
import { auth } from '../../../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import MeetingIdView from '@/modules/meeting/ui/views/meeting-id-view';

interface Props {
    params: Promise<{
        meetingId: string;
    }>;
}

const page = async (props: Props) => {
    const { meetingId } = await props.params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/sign-up');
    }
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
                        description="Loading meeting details"
                    />
                }
            >
                <ErrorBoundary
                    fallback={
                        <ErrorState
                            title="Error loading meeting"
                            description="We were unable to load the meeting details. Please try again later."
                        />
                    }
                >
                    <MeetingIdView meetingId={meetingId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default page;
