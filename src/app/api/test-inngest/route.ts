import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

// GET /api/test-inngest
// Fires a meetings/processing event with a fake local transcript.
// Requires both `npm run dev` and `npm run dev:inngest` to be running.
export async function GET(request: Request) {
    const host = request.headers.get('host') ?? 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const transcriptUrl = `${protocol}://${host}/api/test-inngest/transcript`;

    await inngest.send({
        name: 'meetings/processing',
        data: {
            meetingId: 'JUfUre-9hH6vt5KUHICqt',
            transcriptUrl,
        },
    });

    return NextResponse.json({
        ok: true,
        message: 'Event sent — check http://localhost:8288',
        transcriptUrl,
    });
}
