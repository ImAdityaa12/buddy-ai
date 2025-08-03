'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../../../../../trpc/client';

export default function HomeView() {
    const trpc = useTRPC();
    const greeting = useQuery(trpc.hello.queryOptions({ text: 'world' }));
    console.log(greeting.data?.greeting);
    return (
        <div className="flex flex-col p-4 gap-y-4">
            {greeting.data?.greeting}
        </div>
    );
}
