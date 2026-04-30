import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

// GET /api/test-inngest
// Fires a meetings/processing event with a fake transcript.
// Works both locally and in production.
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
        message: 'Event sent — check Inngest dashboard',
        transcriptUrl,
    });
}
