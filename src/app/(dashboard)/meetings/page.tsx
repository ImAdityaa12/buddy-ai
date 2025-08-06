import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import MeetingsView from '@/modules/meeting/ui/views/meetings-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const page = () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}));
    return (
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
    );
};

export default page;
