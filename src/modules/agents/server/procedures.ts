import { db } from '@/db';
import { agents } from '@/db/schema';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';

export const agentsRouter = createTRPCRouter({
    getMany: baseProcedure.query(async () => {
        const data = await db.select().from(agents);
        return {
            agents: data,
            total: data.length,
        };
    }),
});
