'use client';

import ErrorState from '@/components/error-state';
import React from 'react';

const ErrorPage = () => {
    return (
        <ErrorState
            title="Error loading agents"
            description="We were unable to load your agents. Please try again later."
        />
    );
};

export default ErrorPage;
