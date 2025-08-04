import React from 'react';

interface Props {
    params: Promise<{ agentId: string }>;
}

const page = async ({ params }: Props) => {
    const { agentId } = await params;
    return <div>{agentId}</div>;
};

export default page;
