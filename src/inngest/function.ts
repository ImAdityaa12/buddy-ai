import JSONL from 'jsonl-parse-stringify';
import { inngest } from './client';
import { StreamTranscriptItem } from '@/modules/meeting/types';
import { db } from '@/db';
import { agents, meetingActionItems, meetings, user } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { geminiClient, GEMINI_CHAT_MODEL } from '@/lib/gemini';

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

const ACTION_ITEMS_SYSTEM_PROMPT = `You extract concrete, actionable follow-up tasks from a meeting transcript.

Return ONLY valid JSON matching this exact shape:
{
  "actionItems": [
    { "task": "string — a clear, imperative task", "owner": "string | null — the person responsible if stated, else null", "dueDate": "string | null — a due date or timeframe if mentioned (e.g. 'Friday', 'next sprint'), else null" }
  ]
}

Rules:
- Only include real action items: things someone committed to do or that were explicitly assigned. Do NOT invent tasks.
- Phrase each task concisely in the imperative ("Send the proposal", not "John will send the proposal").
- Put the responsible person in "owner" (not in the task text). Use null if no owner was named.
- Use null for "dueDate" if none was mentioned. Never fabricate a date.
- If there are no action items, return { "actionItems": [] }.`.trim();

type ExtractedActionItem = {
    task: string;
    owner: string | null;
    dueDate: string | null;
};

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
            const response = await geminiClient.chat.completions.create({
                model: GEMINI_CHAT_MODEL,
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

        const actionItems = await step.run('extract-action-items', async () => {
            const response = await geminiClient.chat.completions.create({
                model: GEMINI_CHAT_MODEL,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: ACTION_ITEMS_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content:
                            'Extract the action items from the following transcript:\n' +
                            JSON.stringify(transcriptWithSpeaker),
                    },
                ],
            });

            const raw = response.choices[0].message.content ?? '{}';

            try {
                const parsed = JSON.parse(raw) as {
                    actionItems?: ExtractedActionItem[];
                };
                // Defensive: keep only items with a non-empty task string.
                return (parsed.actionItems ?? []).filter(
                    (item) =>
                        typeof item?.task === 'string' &&
                        item.task.trim().length > 0
                );
            } catch {
                // Bad JSON shouldn't fail the whole job — just skip extraction.
                return [] as ExtractedActionItem[];
            }
        });

        await step.run('save-action-items', async () => {
            // Idempotent: clear AI-extracted items before reinserting so a retry
            // doesn't duplicate them. Manually-added items (source !== 'ai') stay.
            await db
                .delete(meetingActionItems)
                .where(
                    and(
                        eq(meetingActionItems.meetingId, event.data.meetingId),
                        eq(meetingActionItems.source, 'ai')
                    )
                );

            if (actionItems.length === 0) {
                return;
            }

            await db.insert(meetingActionItems).values(
                actionItems.map((item) => ({
                    meetingId: event.data.meetingId as string,
                    task: item.task.trim(),
                    owner: item.owner?.trim() || null,
                    dueDate: item.dueDate?.trim() || null,
                    source: 'ai',
                }))
            );
        });
    }
);
