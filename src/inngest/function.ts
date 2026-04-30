import JSONL from 'jsonl-parse-stringify';
import { inngest } from './client';
import { StreamTranscriptItem } from '@/modules/meeting/types';
import { db } from '@/db';
import { agents, meetings, user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import OpenAI from 'openai';

const SUMMARIZER_SYSTEM_PROMPT = `You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

    Use the following markdown structure for every output:

    ### Overview
    Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

    ### Notes
    Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

    Example:
    #### Section Name
    - Main point or demo shown here
    - Another key insight or interaction
    - Follow-up tool or explanation provided

    #### Next Section
    - Feature X automatically does Y
    - Mention of integration with Z`.trim();

export const meetingsProcessing = inngest.createFunction(
    { id: 'meetings/processing' },
    { event: 'meetings/processing' },
    async ({ event, step }) => {
        const response = await step.run('fetch-transcript', async () => {
            return fetch(event.data.transcriptUrl).then((res) => res.text());
        });

        const transcript = await step.run('parse-transcript', async () => {
            return JSONL.parse<StreamTranscriptItem>(response);
        });

        const transcriptWithSpeaker = await step.run(
            'add-speakers',
            async () => {
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
                        }))
                    );

                const agentSpeakers = await db
                    .select()
                    .from(agents)
                    .where(inArray(agents.id, speakerIds))
                    .then((agents) =>
                        agents.map((agent) => ({
                            ...agent,
                        }))
                    );

                const speakers = [...userSpeakers, ...agentSpeakers];

                return transcript.map((item) => {
                    const speaker = speakers.find(
                        (speaker) => speaker.id === item.speaker_id
                    );

                    if (!speaker) {
                        return {
                            ...item,
                            user: {
                                name: 'Unknown',
                            },
                        };
                    }

                    return {
                        ...item,
                        user: {
                            name: speaker.name,
                        },
                    };
                });
            }
        );

        const summary = await step.run('summarize', async () => {
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: SUMMARIZER_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content:
                            'Summarize the following transcript:\n' +
                            JSON.stringify(transcriptWithSpeaker),
                    },
                ],
            });
            return response.choices[0].message.content ?? '';
        });

        await step.run('save-summary', async () => {
            await db
                .update(meetings)
                .set({
                    summary,
                    status: 'completed',
                })
                .where(eq(meetings.id, event.data.meetingId));
        });
    }
);
