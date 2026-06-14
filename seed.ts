/**
 * Dev seed script. Creates a loginable demo user (email/password) plus a set of
 * agents and meetings so the dashboard isn't empty during development.
 *
 * Run:  npm run db:seed
 * Login afterwards with:  demo@buddy.ai / password123
 *
 * Idempotent: re-running wipes the demo user's agents (meetings cascade) and
 * reseeds them. It never touches other users' data.
 */
import 'dotenv/config'; // must be first: @/db reads DATABASE_URL at import time

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { auth } from './auth';
import { db } from '@/db';
import { account, agents, meetings, user } from '@/db/schema';

const TEST_EMAIL = 'demo@buddy.ai';
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Demo User';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = new Date();
const ago = (ms: number) => new Date(now.getTime() - ms);
const ahead = (ms: number) => new Date(now.getTime() + ms);

async function getOrCreateDemoUser(): Promise<string> {
    const [existing] = await db
        .select()
        .from(user)
        .where(eq(user.email, TEST_EMAIL));

    if (existing) {
        console.log(`• Demo user already exists: ${existing.id}`);
        return existing.id;
    }

    // Preferred path: Better Auth signup (correct password hash + Polar customer
    // that the premium tRPC procedures expect).
    try {
        const res = await auth.api.signUpEmail({
            body: { email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME },
        });
        console.log(`• Created demo user via Better Auth: ${res.user.id}`);
        return res.user.id;
    } catch (err) {
        // Fallback (e.g. Polar sandbox unreachable): create the user + credential
        // account directly, hashing the password with Better Auth's own hasher so
        // login still works. Premium/Polar features may be limited.
        console.warn(
            '• Better Auth signup failed, falling back to direct insert:',
            err instanceof Error ? err.message : err
        );
        const ctx = await auth.$context;
        const hashed = await ctx.password.hash(TEST_PASSWORD);
        const userId = nanoid();
        await db.insert(user).values({
            id: userId,
            name: TEST_NAME,
            email: TEST_EMAIL,
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
        });
        await db.insert(account).values({
            id: nanoid(),
            accountId: userId,
            providerId: 'credential',
            userId,
            password: hashed,
            createdAt: now,
            updatedAt: now,
        });
        console.log(`• Created demo user via fallback: ${userId}`);
        return userId;
    }
}

const AGENT_SEEDS = [
    {
        name: 'Standup Facilitator',
        instructions:
            'You run daily standups. Ask each participant what they did yesterday, what they plan today, and any blockers. Keep it brisk and timeboxed. Surface blockers clearly at the end.',
    },
    {
        name: 'Sales Coach',
        instructions:
            'You are a sales coach observing a discovery call. Listen for pain points, budget, authority, need, and timeline. Afterwards, give constructive feedback on questioning and objection handling.',
    },
    {
        name: 'Interview Practice',
        instructions:
            'You are a technical interviewer. Ask one question at a time, probe for depth, and stay encouraging. Cover data structures, system design, and behavioral topics.',
    },
    {
        name: 'Product Brainstorm',
        instructions:
            'You facilitate product brainstorms. Encourage divergent ideas first, then help converge. Capture decisions and open questions. Keep energy high and judgement low.',
    },
];

function summaryFor(topic: string, points: string[]): string {
    return `### Overview
${topic}

### Notes
#### Discussion
${points.map((p) => `- ${p}`).join('\n')}

#### Next steps
- Owners to follow up on open items before the next session
- Notes shared with all participants`;
}

async function main() {
    console.log('Seeding dev database…');
    const userId = await getOrCreateDemoUser();

    // Idempotency: remove this user's agents (meetings cascade) before reseeding.
    await db.delete(agents).where(eq(agents.userId, userId));
    console.log('• Cleared previous demo agents/meetings');

    const insertedAgents = await db
        .insert(agents)
        .values(AGENT_SEEDS.map((a) => ({ ...a, userId })))
        .returning();
    console.log(`• Inserted ${insertedAgents.length} agents`);

    const [standup, sales, interview, brainstorm] = insertedAgents;

    const meetingSeeds = [
        {
            name: 'Daily Standup — Mon',
            agentId: standup.id,
            status: 'completed' as const,
            startedAt: ago(3 * DAY),
            endedAt: ago(3 * DAY - 14 * MIN),
            summary: summaryFor(
                'The team synced on sprint progress. Auth refactor is on track; the billing migration hit a snag with webhook retries.',
                [
                    'Auth refactor merged behind a feature flag',
                    'Billing webhook retries causing duplicate events — needs idempotency keys',
                    'QA environment was down for ~1h, now restored',
                ]
            ),
        },
        {
            name: 'Discovery Call — Acme Corp',
            agentId: sales.id,
            status: 'completed' as const,
            startedAt: ago(2 * DAY),
            endedAt: ago(2 * DAY - 38 * MIN),
            summary: summaryFor(
                'Discovery call with Acme Corp. Strong pain around manual meeting notes; champion identified; budget tentatively confirmed.',
                [
                    'Pain: reps spend ~5 hrs/week on manual call notes',
                    'Decision maker is the VP of Sales; champion is the RevOps lead',
                    'Budget range $15–25k/yr; timeline Q3',
                ]
            ),
        },
        {
            name: 'System Design Interview Prep',
            agentId: interview.id,
            status: 'completed' as const,
            startedAt: ago(1 * DAY),
            endedAt: ago(1 * DAY - 52 * MIN),
            summary: summaryFor(
                'Mock system design session on a URL shortener. Candidate handled scaling well but missed cache invalidation details.',
                [
                    'Covered hashing scheme and DB schema',
                    'Discussed read-heavy scaling with caching + CDN',
                    'Gap: cache invalidation and analytics pipeline',
                ]
            ),
        },
        {
            name: 'Q3 Roadmap Brainstorm',
            agentId: brainstorm.id,
            status: 'completed' as const,
            startedAt: ago(6 * HOUR),
            endedAt: ago(6 * HOUR - 47 * MIN),
            summary: summaryFor(
                'Generated and ranked Q3 feature ideas. Action items and search across meetings rose to the top.',
                [
                    'Top ideas: action-item extraction, semantic search, calendar auto-join',
                    'Decision: ship action items first as the fastest high-impact win',
                    'Open question: build teams/workspaces before or after search?',
                ]
            ),
        },
        {
            name: 'Daily Standup — Tue',
            agentId: standup.id,
            status: 'upcoming' as const,
            startedAt: null,
            endedAt: null,
            summary: null,
        },
        {
            name: 'Discovery Call — Globex',
            agentId: sales.id,
            status: 'active' as const,
            startedAt: ago(12 * MIN),
            endedAt: null,
            summary: null,
        },
        {
            name: 'Behavioral Interview Round',
            agentId: interview.id,
            status: 'processing' as const,
            startedAt: ago(2 * HOUR),
            endedAt: ago(2 * HOUR - 33 * MIN),
            summary: null,
        },
        {
            name: 'Cancelled — Vendor Sync',
            agentId: brainstorm.id,
            status: 'cancelled' as const,
            startedAt: null,
            endedAt: null,
            summary: null,
        },
    ];

    const insertedMeetings = await db
        .insert(meetings)
        .values(
            meetingSeeds.map((m) => ({
                ...m,
                userId,
                createdAt: m.startedAt ?? ahead(1 * DAY),
            }))
        )
        .returning();
    console.log(`• Inserted ${insertedMeetings.length} meetings`);

    console.log('\n✓ Seed complete.');
    console.log(`  Login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
