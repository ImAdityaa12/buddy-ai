// Serves a fake JSONL transcript for local Inngest testing.
// Matches the StreamTranscriptItem shape.
export async function GET() {
    const lines = [
        { speaker_id: 'user-1', type: 'speech', text: 'Hey, welcome to the meeting!', start_ts: 0, stop_ts: 3 },
        { speaker_id: 'agent-1', type: 'speech', text: 'Thanks for having me. Let\'s get started.', start_ts: 4, stop_ts: 7 },
        { speaker_id: 'user-1', type: 'speech', text: 'Today we will discuss the new feature roadmap.', start_ts: 8, stop_ts: 12 },
        { speaker_id: 'agent-1', type: 'speech', text: 'Sounds great. I have a few suggestions as well.', start_ts: 13, stop_ts: 17 },
        { speaker_id: 'user-1', type: 'speech', text: 'Let\'s prioritise shipping the dashboard first.', start_ts: 18, stop_ts: 22 },
    ];

    const body = lines.map((l) => JSON.stringify(l)).join('\n');

    return new Response(body, {
        headers: { 'Content-Type': 'application/jsonl' },
    });
}
