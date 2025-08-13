import { db } from '@/db';
import { agents, meetings, user } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import {
    and,
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
});
