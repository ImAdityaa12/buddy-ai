import HomeView from '@/modules/home/ui/views/home-view';
import React from 'react';
import { getQueryClient, trpc } from '../../../trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const page = async () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.hello.queryOptions({
            text: 'Hello',
        })
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeView />
        </HydrationBoundary>
    );
};

export default page;
