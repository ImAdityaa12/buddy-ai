import 'server-only';
import { StreamClient } from '@stream-io/node-sdk';

export const streamVideo = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_API_SECRET!
);

export function generateAgentToken(agentUserId: string, callCid: string): string {
    const iat = Math.floor(Date.now() / 1000) - 60;
    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    return streamVideo.generateCallToken({
        user_id: agentUserId,
        call_cids: [callCid],
        iat,
        exp,
    });
}
