/**
 * Dev utility: inspect (and optionally fix) the Stream app's webhook config.
 *
 *   npx tsx scripts/stream-webhook.ts            # inspect current config
 *   npx tsx scripts/stream-webhook.ts --fix      # set webhook URL + enable all events
 *
 * Set WEBHOOK_URL below or via env to your public tunnel + /api/webhook.
 */
import 'dotenv/config';
import { StreamClient } from '@stream-io/node-sdk';

const client = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_API_SECRET!
);

const WEBHOOK_URL =
    process.env.STREAM_WEBHOOK_URL ??
    'https://improved-humpback-clever.ngrok-free.app/api/webhook';

async function main() {
    const shouldFix = process.argv.includes('--fix');

    const app = await client.getApp();
    const a = (app as unknown as { app: Record<string, unknown> }).app ?? app;
    console.log('=== Webhook-relevant config ===');
    console.log('legacy webhook_url:', JSON.stringify(a.webhook_url));
    const hooks = (a.event_hooks as Array<Record<string, unknown>>) ?? [];
    console.log(`event_hooks: ${hooks.length}`);
    for (const h of hooks) {
        const ets = (h.event_types as string[]) ?? [];
        const callEvents = ets.filter((e) => e.startsWith('call.'));
        console.log('\n--- hook ---');
        console.log('  id      :', h.id);
        console.log('  type    :', h.hook_type);
        console.log('  enabled :', h.enabled);
        console.log(
            '  url     :',
            h.webhook_url ?? h.webhook_url_v2 ?? h.url ?? h.callback_url ?? '(none)'
        );
        console.log('  #events :', ets.length, '| has "*":', ets.includes('*'));
        console.log(
            '  call.session_started included:',
            ets.includes('call.session_started')
        );
        console.log('  call.* events:', callEvents.join(', ') || '(none)');
    }

    if (!shouldFix) {
        console.log(
            '\nRun again with --fix to set the webhook URL and enable all events.'
        );
        return;
    }

    console.log(`\n=== Fixing: setting webhook_url -> ${WEBHOOK_URL} ===`);
    await client.updateApp({
        webhook_url: WEBHOOK_URL,
        // Empty/unset event list = send all events (incl. call.session_started).
        webhook_events: [],
    });
    console.log('Updated. Re-fetching to confirm:');
    const after = await client.getApp();
    console.log(JSON.stringify(after, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('stream-webhook script failed:', err);
        process.exit(1);
    });
