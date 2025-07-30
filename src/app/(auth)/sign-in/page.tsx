import SignInView from '@/modules/auth/ui/views/sign-in-view';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { auth } from '../../../../auth';

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!!session) {
        redirect('/');
    }
    return <SignInView />;
};

export default page;
