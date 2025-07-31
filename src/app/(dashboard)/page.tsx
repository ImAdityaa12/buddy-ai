import HomeView from '@/modules/home/ui/views/home-view';
import React from 'react';
import { auth } from '../../../auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect('/sign-in');
    }
    return <HomeView />;
};

export default page;
