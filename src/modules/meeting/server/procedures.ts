import { db } from '@/db';
import {
    agents,
    meetingActionItems,
    meetingDecisions,
    meetings,
    user,
} from '@/db/schema';
import {
    createTRPCRouter,
    premiumProcedure,
    protectedProcedure,
} from '@/trpc/init';
import { z } from 'zod';
import {
    and,
    asc,
    count,
    desc,
    eq,
    getTableColumns,
    ilike,
    inArray,
    sql,
} from 'drizzle-orm';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    MIN_PAGE_SIZE,
} from '@/constants';
import { TRPCError } from '@trpc/server';
import { meetingsInsertSchema, meetingsUpdateSchema } from '../schema';
import { MeetingStatus, StreamTranscriptItem } from '../types';
import { streamVideo } from '@/lib/stream-video';
import { generateAvatarUri } from '@/lib/avatar';
import JSONL from 'jsonl-parse-stringify';
import { streamChat } from '@/lib/stream-chat';

export const meetingsRouter = createTRPCRouter({
    generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
        const { user } = ctx.auth;
        const token = streamChat.createToken(user.id);
        await streamChat.upsertUser({
            id: user.id,
            role: 'admin',
        });
        return token;
    }),
    getTranscript: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { id } = input;
            const [meeting] = await db
                .select()
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );
            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            if (!meeting.transcriptUrl) {
                return [];
            }

            const transcript = await fetch(meeting.transcriptUrl)
                .then((res) => res.text())
                .then((text) => JSONL.parse<StreamTranscriptItem>(text))
                .catch(() => {
                    return [];
                });

            const speakerIds = [
                ...new Set(transcript.map((item) => item.speaker_id)),
            ];

            const userSpeakers = await db
                .select()
                .from(user)
                .where(inArray(user.id, speakerIds))
                .then((users) =>
                    users.map((user) => ({
                        ...user,
                        image:
                            user.image ??
                            generateAvatarUri({
                                seed: user.name,
                                variant: 'initials',
                            }),
                    }))
                );

            const agentSpeakers = await db
                .select()
                .from(agents)
                .where(inArray(agents.id, speakerIds))
                .then((agents) =>
                    agents.map((agent) => ({
                        ...agent,
                        image: generateAvatarUri({
                            seed: agent.name,
                            variant: 'botttsNeutral',
                        }),
                    }))
                );
            const speakers = [...userSpeakers, ...agentSpeakers];

            const transcriptWithSpeaker = transcript.map((item) => {
                const speaker = speakers.find(
                    (speaker) => speaker.id === item.speaker_id
                );
                if (speaker) {
                    return {
                        ...item,
                        user: speaker,
                    };
                } else {
                    return {
                        ...item,
                        user: {
                            name: 'Unknown',
                            image: generateAvatarUri({
                                seed: 'Unknown',
                                variant: 'initials',
                            }),
                        },
                    };
                }
            });

            return transcriptWithSpeaker;
        }),

    generateToken: protectedProcedure.mutation(async ({ ctx }) => {
        await streamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                name: ctx.auth.user.name,
                role: 'admin',
                image:
                    ctx.auth.user.image ??
                    generateAvatarUri({
                        seed: ctx.auth.user.id,
                        variant: 'initials',
                    }),
            },
        ]);

        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const issuedAt = Math.floor(Date.now() / 1000) - 60;
        const token = streamVideo.generateUserToken({
            user_id: ctx.auth.user.id,
            exp: expirationTime,
            validity_in_seconds: issuedAt,
        });

        return token;
    }),
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
    create: premiumProcedure('meetings')
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

            const call = streamVideo.video.call('default', createdMeeting.id);
            await call.create({
                data: {
                    created_by_id: ctx.auth.user.id,
                    custom: {
                        meetingId: createdMeeting.id,
                        meetingName: createdMeeting.name,
                    },
                    settings_override: {
                        transcription: {
                            language: 'en',
                            mode: 'auto-on',
                            closed_caption_mode: 'auto-on',
                        },
                        recording: {
                            mode: 'auto-on',
                            quality: '1080p',
                        },
                    },
                },
            });

            const [existingAgent] = await db
                .select()
                .from(agents)
                .where(eq(agents.id, createdMeeting.agentId));

            if (!existingAgent) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Agent Not Found',
                });
            }

            await streamVideo.upsertUsers([
                {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    role: 'admin',
                    image: generateAvatarUri({
                        seed: existingAgent.name,
                        variant: 'botttsNeutral',
                    }),
                },
            ]);

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

    getActionItems: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ input, ctx }) => {
            // Ownership check: the meeting must belong to the caller.
            const [meeting] = await db
                .select({ id: meetings.id })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            return db
                .select()
                .from(meetingActionItems)
                .where(eq(meetingActionItems.meetingId, input.meetingId))
                .orderBy(
                    asc(meetingActionItems.completed),
                    asc(meetingActionItems.createdAt)
                );
        }),

    addActionItem: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                task: z.string().min(1, 'Task is required').max(500),
                owner: z.string().max(120).nullish(),
                dueDate: z.string().max(120).nullish(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const [meeting] = await db
                .select({ id: meetings.id })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            const [created] = await db
                .insert(meetingActionItems)
                .values({
                    meetingId: input.meetingId,
                    task: input.task.trim(),
                    owner: input.owner?.trim() || null,
                    dueDate: input.dueDate?.trim() || null,
                    source: 'manual',
                })
                .returning();

            return created;
        }),

    toggleActionItem: protectedProcedure
        .input(z.object({ id: z.string(), completed: z.boolean() }))
        .mutation(async ({ input, ctx }) => {
            // Verify the item belongs to a meeting owned by the caller.
            const [item] = await db
                .select({ id: meetingActionItems.id })
                .from(meetingActionItems)
                .innerJoin(
                    meetings,
                    eq(meetingActionItems.meetingId, meetings.id)
                )
                .where(
                    and(
                        eq(meetingActionItems.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Action item not found',
                });
            }

            const [updated] = await db
                .update(meetingActionItems)
                .set({ completed: input.completed, updatedAt: new Date() })
                .where(eq(meetingActionItems.id, input.id))
                .returning();

            return updated;
        }),

    removeActionItem: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const [item] = await db
                .select({ id: meetingActionItems.id })
                .from(meetingActionItems)
                .innerJoin(
                    meetings,
                    eq(meetingActionItems.meetingId, meetings.id)
                )
                .where(
                    and(
                        eq(meetingActionItems.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Action item not found',
                });
            }

            const [deleted] = await db
                .delete(meetingActionItems)
                .where(eq(meetingActionItems.id, input.id))
                .returning();

            return deleted;
        }),

    getDecisions: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ input, ctx }) => {
            // Ownership check: the meeting must belong to the caller.
            const [meeting] = await db
                .select({ id: meetings.id })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            return db
                .select()
                .from(meetingDecisions)
                .where(eq(meetingDecisions.meetingId, input.meetingId))
                .orderBy(asc(meetingDecisions.createdAt));
        }),

    addDecision: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                decision: z.string().min(1, 'Decision is required').max(500),
                context: z.string().max(1000).nullish(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const [meeting] = await db
                .select({ id: meetings.id })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting Not Found',
                });
            }

            const [created] = await db
                .insert(meetingDecisions)
                .values({
                    meetingId: input.meetingId,
                    decision: input.decision.trim(),
                    context: input.context?.trim() || null,
                    source: 'manual',
                })
                .returning();

            return created;
        }),

    removeDecision: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            // Verify the decision belongs to a meeting owned by the caller.
            const [item] = await db
                .select({ id: meetingDecisions.id })
                .from(meetingDecisions)
                .innerJoin(meetings, eq(meetingDecisions.meetingId, meetings.id))
                .where(
                    and(
                        eq(meetingDecisions.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                );

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Decision not found',
                });
            }

            const [deleted] = await db
                .delete(meetingDecisions)
                .where(eq(meetingDecisions.id, input.id))
                .returning();

            return deleted;
        }),
});
