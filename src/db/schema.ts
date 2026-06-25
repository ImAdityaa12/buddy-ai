import { nanoid } from 'nanoid';
import { pgTable, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified')
        .$defaultFn(() => false)
        .notNull(),
    image: text('image'),
    createdAt: timestamp('created_at')
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp('updated_at')
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').$defaultFn(
        () => /* @__PURE__ */ new Date()
    ),
    updatedAt: timestamp('updated_at').$defaultFn(
        () => /* @__PURE__ */ new Date()
    ),
});

export const agents = pgTable('agents', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
        }),
    instructions: text('instructions').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const meetingStatus = pgEnum('meeting_status', [
    'upcoming',
    'active',
    'completed',
    'processing',
    'cancelled',
]);

export const meetings = pgTable('meetings', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
        }),
    agentId: text('agent_id')
        .notNull()
        .references(() => agents.id, {
            onDelete: 'cascade',
        }),
    status: meetingStatus('status').notNull().default('upcoming'),
    startedAt: timestamp('started_at'),
    endedAt: timestamp('ended_at'),
    transcriptUrl: text('transcript_url'),
    recordingUrl: text('recording_url'),
    summary: text('summary'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Structured action items extracted from a meeting transcript by the
// post-processing job (see src/inngest/function.ts). Users can also add/remove
// items manually and check them off.
export const meetingActionItems = pgTable('meeting_action_items', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => nanoid()),
    meetingId: text('meeting_id')
        .notNull()
        .references(() => meetings.id, {
            onDelete: 'cascade',
        }),
    task: text('task').notNull(),
    // Free-text so the model can return a name or "Unassigned"; nullable.
    owner: text('owner'),
    // Free-text so the model can return a relative date like "next Friday"; nullable.
    dueDate: text('due_date'),
    completed: boolean('completed').notNull().default(false),
    // Distinguishes AI-extracted items from ones the user added by hand.
    source: text('source').notNull().default('ai'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Key decisions captured from a meeting transcript by the post-processing job
// (see src/inngest/function.ts). Users can also add/remove decisions manually.
// Unlike action items these aren't "completable" — they're a record of what
// was decided.
export const meetingDecisions = pgTable('meeting_decisions', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => nanoid()),
    meetingId: text('meeting_id')
        .notNull()
        .references(() => meetings.id, {
            onDelete: 'cascade',
        }),
    decision: text('decision').notNull(),
    // Free-text rationale / background for the decision; nullable.
    context: text('context'),
    // Distinguishes AI-extracted decisions from ones the user added by hand.
    source: text('source').notNull().default('ai'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
