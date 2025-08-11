import { db } from '@/db';
import { agents, meetings } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { and, count, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    MIN_PAGE_SIZE,
} from '@/constants';
import { TRPCError } from '@trpc/server';
import { meetingsInsertSchema, meetingsUpdateSchema } from '../schema';
import { MeetingStatus } from '../types';

export const meetingsRouter = createTRPCRouter({
    remove: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { auth } = ctx;
            const { id } = input;
            const [deletedMeeting] = await db
                .delete(meetings)
                .where(
                    and(eq(meetings.id, id), eq(meetings.userId, auth.user.id))
                )
                .returning();

            if (!deletedMeeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            return deletedMeeting;
        }),

    update: protectedProcedure
        .input(meetingsUpdateSchema)
        .mutation(async ({ input, ctx }) => {
            const { auth } = ctx;
            const { id, ...rest } = input;
            const [updatedMeeting] = await db
                .update(meetings)
                .set({
                    ...rest,
                    updatedAt: new Date(),
                })
                .where(
                    and(eq(meetings.id, id), eq(meetings.userId, auth.user.id))
                )
                .returning();

            if (!updatedMeeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            return updatedMeeting;
        }),
    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const { auth } = ctx;
            const [createdMeeting] = await db
                .insert(meetings)
                .values({
                    ...input,
                    userId: auth.user.id,
                })
                .returning();

            //TODO: Create Stream Call, Upsert Stream Users

            return createdMeeting;
        }),
    getOne: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const [data] = await db
                .select({
                    ...getTableColumns(meetings),
                    agent: agents,
                    duration:
                        sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
                            'duration'
                        ),
                })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!data) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }
            return data;
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(MIN_PAGE_SIZE)
                    .max(MAX_PAGE_SIZE)
                    .default(DEFAULT_PAGE_SIZE),
                search: z.string().nullish(),
                agentId: z.string().nullish(),
                status: z
                    .enum([
                        MeetingStatus.Upcoming,
                        MeetingStatus.Active,
                        MeetingStatus.Completed,
                        MeetingStatus.Processing,
                        MeetingStatus.Cancelled,
                    ])
                    .nullish(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { page, pageSize, search, agentId, status } = input;
            const data = await db
                .select({
                    ...getTableColumns(meetings),
                    agent: agents,
                    duration:
                        sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
                            'duration'
                        ),
                })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        agentId ? eq(meetings.agentId, agentId) : undefined,
                        status ? eq(meetings.status, status) : undefined,
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const [total] = await db
                .select({ count: count() })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        agentId ? eq(meetings.agentId, agentId) : undefined,
                        status ? eq(meetings.status, status) : undefined,
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                );
            const totalPages = Math.ceil(total.count / pageSize);
            return {
                items: data,
                total: total.count,
                totalPages,
            };
        }),
});
