'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';

const UpgradeView = () => {
    const trpc = useTRPC();
    const { data: products } = useSuspenseQuery(
        trpc.premium.getProducts.queryOptions()
    );
    const { data: subscription } = useSuspenseQuery(
        trpc.premium.getCurrentSubscripton.queryOptions()
    );

    return <div>UpgradeView</div>;
};

export default UpgradeView;
