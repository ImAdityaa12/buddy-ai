import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { agentsRouter } from '@/modules/agents/server/procedures';
import { db } from '@/db';
import { agents } from '@/db/schema';
export const appRouter = createTRPCRouter({
    hello: baseProcedure
        .input(
            z.object({
                text: z.string(),
            })
        )
        .query((opts) => {
            return {
                greeting: `hello ${opts.input.text}`,
            };
        }),
    agentsagain: baseProcedure.query(async () => {
        const data = await db.select().from(agents);
        return data;
    }),
    agents: agentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
