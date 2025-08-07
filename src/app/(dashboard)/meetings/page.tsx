import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import MeetingListHeader from '@/modules/meeting/ui/components/meeting-list-header';
import MeetingsView from '@/modules/meeting/ui/views/meetings-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { auth } from '../../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/sign-in');
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}));

    return (
        <>
            <MeetingListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense
                    fallback={
                        <LoadingState
                            title="Loading meetings"
                            description="Please wait while we load the meetings."
                        />
                    }
                >
                    <ErrorBoundary
                        fallback={
                            <ErrorState
                                title="Something went wrong"
                                description="We're sorry, but something went wrong. Please try again."
                            />
                        }
                    >
                        <MeetingsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    );
};

export default page;
