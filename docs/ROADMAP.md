# Buddy AI — Feature Roadmap & Ideas

This document captures concrete ideas for taking Buddy AI from a working core to a
genuinely useful, sellable product. Each idea lists **what** it is, **why** it
matters, **how** it fits the current architecture (with the real files/tables it
touches), a rough **effort** estimate (S = hours, M = a day or two, L = several
days+), and any **dependencies**.

## What exists today (baseline)

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · tRPC + TanStack Query · Drizzle ORM + Neon (Postgres) · Better Auth (+ Polar billing) · Stream Video + Stream Chat · Inngest (background jobs) · Gemini (summaries + chat) · shadcn/ui.
- **In-meeting AI:** a Python FastAPI worker (`agent-worker/main.py`) using Vision Agents + Gemini Live (speech-to-speech). The Next webhook asks it to join on `call.session_started`.
- **Flow:** create agent (name + instructions) → create meeting tied to an agent → join Stream video call → agent joins live → call recorded + transcribed → Inngest job (`src/inngest/function.ts`) generates a markdown summary → post-meeting chat about the meeting (`src/app/api/webhook/route.ts`, `message.new`).
- **Data model (`src/db/schema.ts`):** `user`, `session`, `account`, `verification`, `agents`, `meetings`. Everything is scoped per `userId`.
- **Billing:** Polar with free-tier usage limits (`src/modules/premium/server/procedures.ts`).

**Core gap:** a meeting's only structured output is a prose summary, and meetings
are created manually one at a time. The roadmap below closes that gap.

---

## Tier 0 — Harden what exists (do alongside everything else)

### 0.1 Reliable agent join (status tracking + retry)
- **What:** The webhook currently fires `POST {workerUrl}/join` fire-and-forget and only logs on failure (`src/app/api/webhook/route.ts:130-152`). If the Python worker is down, the call silently has no AI and nobody knows.
- **Why:** This is the product's core promise. Silent failure is the worst failure.
- **How:** Add an `agentJoinStatus` enum column to `meetings` (`pending | joined | failed`). Have the worker call back a small Next endpoint (or update via Stream custom data) when it actually joins. Retry the join via Inngest with backoff if no callback arrives within N seconds. Surface status in the call UI.
- **Effort:** M · **Depends on:** none.

### 0.2 Observability & error monitoring
- **What:** Add Sentry (or similar) to both the Next app and the Python worker; replace the ad-hoc `console.log` debugging in the webhook with structured logging.
- **Why:** You can't improve what you can't see; webhook/worker failures are currently invisible in production.
- **Effort:** S–M · **Depends on:** none.

### 0.3 Rate limiting & abuse protection
- **What:** Rate-limit the public webhook and tRPC mutations; validate the `message.new` path can't be spammed.
- **Why:** The webhook is internet-facing and triggers LLM calls (cost).
- **Effort:** S · **Depends on:** none.

### 0.4 Real dashboard on the home page
- **What:** `src/modules/home/ui/views/home-view.tsx` is currently a near-empty landing. Make it a dashboard: meetings over time, total talk time, upcoming meetings, recent summaries, action-item completion rate.
- **Why:** First thing users see; turns a blank screen into daily value. `recharts` is already installed.
- **Effort:** M · **Depends on:** richer per-meeting data (Tier 1) for the best version.

---

## Tier 1 — Make each meeting's output 10× more useful

> These all extend the existing transcript→Gemini pipeline in `src/inngest/function.ts`. Highest "wow per hour."

### 1.1 Action items extraction ⭐ (recommended first)
- **What:** After summarizing, run a second Gemini step that returns structured action items: `{ task, owner, dueDate?, sourceTimestamp }`. Store in a new `meeting_action_items` table. Render as a checklist on the meeting page with check-off.
- **Why:** *The* most-requested feature of every meeting tool (Otter, Fireflies, Fathom). Converts talk into trackable work.
- **How:** New step in `meetingsProcessing` using Gemini structured/JSON output; new Drizzle table FK'd to `meetings`; tRPC `actionItems.list/toggle`; UI section in `src/app/(dashboard)/meetings/[meetingId]`.
- **Effort:** M · **Depends on:** none.

### 1.2 Decisions log
- **What:** Extract key decisions made during the meeting (`{ decision, context, timestamp }`) into their own list.
- **Why:** "What did we decide?" is the second-most-common ask after action items.
- **How:** Same pattern as 1.1 — extra extraction step + table + UI tab.
- **Effort:** S (once 1.1 exists) · **Depends on:** 1.1 pattern.

### 1.3 Chapters / key moments with jump-to-timestamp
- **What:** Generate chapter markers (`{ title, startTime }`) from the timestamped transcript. Clicking a chapter seeks the recording.
- **Why:** Nobody rewatches a 45-min recording; they jump to the part they need.
- **How:** The transcript items already carry timestamps; `recordingUrl` is already stored. Generate chapters in the Inngest job, render over the recording player.
- **Effort:** M · **Depends on:** none.

### 1.4 Synced "karaoke" transcript
- **What:** As the recording plays, highlight the current transcript line and let users click any line to seek.
- **Why:** Makes the recording + transcript a single navigable artifact.
- **How:** Map transcript timestamps to the video player's `currentTime` in the meeting view.
- **Effort:** M · **Depends on:** 1.3 (timestamp plumbing).

### 1.5 Speaker analytics
- **What:** Talk-time per participant, talk ratio, # of questions asked, basic sentiment per speaker.
- **Why:** Huge for sales calls, coaching, interviews, and balanced standups.
- **How:** Compute from `speaker_id` + timestamps in the transcript (already mapped to names in `function.ts:add-speakers`). Visualize with `recharts`.
- **Effort:** M · **Depends on:** none.

### 1.6 Auto-title meetings
- **What:** Replace/augment the user-provided name with an AI-generated title from the content.
- **Why:** "Meeting 3" is useless; "Q3 pricing decision w/ Sales" is searchable.
- **Effort:** S · **Depends on:** none.

### 1.7 Follow-up recap email draft
- **What:** Generate a ready-to-send recap email (summary + action items + decisions). One-click copy, later one-click send (see 3.2).
- **Why:** Closes the loop after a meeting; saves the most tedious post-meeting chore.
- **Effort:** S · **Depends on:** 1.1/1.2 for best content.

### 1.8 Multiple summary formats
- **What:** Let users pick TL;DR / detailed notes / bullet recap / by-speaker, regenerate on demand.
- **Why:** Different meetings need different granularity.
- **Effort:** S · **Depends on:** none.

---

## Tier 2 — Turn meetings into a searchable knowledge base (the moat)

### 2.1 Semantic search across all meetings (RAG) ⭐
- **What:** Embed each transcript (chunked) with Gemini embeddings into `pgvector` on Neon. Add full-history search.
- **Why:** Moves the product from "meeting notes" to "team memory." This is the defensible differentiator.
- **How:** Enable the `pgvector` extension on Neon; add an `embeddings` table (or a vector column on transcript chunks); generate embeddings in the Inngest job after transcription; query with cosine similarity.
- **Effort:** L · **Depends on:** none (but pairs with 2.2).

### 2.2 "Ask my meetings" global chat
- **What:** A chat that answers across the entire meeting history: *"What did we decide about pricing last month?"* — retrieves relevant chunks (2.1) and answers with citations linking back to the source meeting + timestamp.
- **Why:** The natural payoff of 2.1; the feature users will open daily.
- **How:** New top-level page + tRPC/route that does retrieve-then-generate over the embeddings, reusing the Gemini client.
- **Effort:** M (on top of 2.1) · **Depends on:** 2.1.

### 2.3 Auto topic tagging & filtering
- **What:** Auto-tag meetings by topic/theme; browse and filter by tag.
- **Why:** Makes a growing archive navigable beyond plain search.
- **How:** Extra extraction step; `tags` table + join; extend the existing meeting filters (`src/modules/meeting/ui/components`).
- **Effort:** M · **Depends on:** none.

---

## Tier 3 — Integrations (where day-to-day usefulness lives)

### 3.1 Google Calendar sync + auto-join ⭐
- **What:** Connect a Google Calendar; auto-create Buddy meetings from calendar events and have the bot auto-join scheduled calls — instead of creating each meeting by hand.
- **Why:** The difference between a demo and a daily driver. This is how Otter/Fireflies win.
- **How:** Better Auth already does Google OAuth (the `account` table stores tokens/scopes); add calendar scopes; poll/subscribe to events; schedule joins via Inngest. (Google Calendar MCP is also available for prototyping.)
- **Effort:** L · **Depends on:** 0.1 (reliable join) strongly recommended.

### 3.2 Slack / email delivery of summaries
- **What:** After a meeting completes, post the summary + action items to a Slack channel and/or email attendees.
- **Why:** Meets users where they already are; drives recurring engagement.
- **How:** New Inngest step after `save-summary`; Slack OAuth + webhook, or transactional email (Resend). Pairs with 1.7.
- **Effort:** M · **Depends on:** 1.1/1.7 for content.

### 3.3 Export to Notion / PDF / Markdown
- **What:** One-click export of a meeting's summary + notes to Notion, a PDF, or a Markdown download.
- **Why:** Teams keep knowledge in their own tools; reduces lock-in friction.
- **Effort:** M (Notion) / S (Markdown/PDF) · **Depends on:** none.

### 3.4 Outbound webhooks / Zapier
- **What:** Let users register webhooks fired on `meeting.completed` with the structured payload (summary, action items, decisions).
- **Why:** Unlocks unlimited custom integrations without you building each one.
- **Effort:** M · **Depends on:** 1.1/1.2 for a payload worth sending.

---

## Tier 4 — Teams & collaboration (unlocks the real SaaS business)

### 4.1 Organizations / workspaces ⭐
- **What:** Introduce orgs/workspaces. Everything is currently per-`userId` (`src/db/schema.ts`); add an `organization` layer with membership.
- **Why:** You can't sell a meeting tool to a team if data is siloed per individual. This is the foundation for everything else in this tier.
- **How:** Better Auth has an **organization plugin**; add `organizationId` to `agents` and `meetings`; scope all queries by org membership instead of (or in addition to) `userId`.
- **Effort:** L · **Depends on:** none (but touches every query — do it before the archive grows).

### 4.2 Shared agents & meetings
- **What:** Agents and meetings owned by the workspace, visible to members per role.
- **Why:** A team's "Sales Coach" agent should be shared, not recreated by each person.
- **Effort:** M (after 4.1) · **Depends on:** 4.1.

### 4.3 Public / link sharing of a summary
- **What:** Generate a read-only public link to a meeting summary (optionally password/expiry protected).
- **Why:** Sharing recaps with people who aren't users is a major growth loop.
- **Effort:** M · **Depends on:** none (nice with 4.1).

### 4.4 Roles & permissions
- **What:** Owner / admin / member roles controlling who can create agents, delete meetings, manage billing.
- **Effort:** M · **Depends on:** 4.1.

### 4.5 Comments & annotations on transcript
- **What:** Let teammates comment on transcript lines or summary sections (async discussion on the meeting).
- **Effort:** M · **Depends on:** 4.1.

---

## Tier 5 — Deepen the live experience (leverage Vision Agents — currently underused)

### 5.1 Live notes & action items during the call
- **What:** A side panel that shows running notes / captured action items *while* the meeting happens, not just after.
- **Why:** Real-time value; participants self-correct ("make sure that's an action item").
- **How:** Stream live transcription into a panel in `src/app/call/[meetingId]`; incrementally summarize.
- **Effort:** L · **Depends on:** none.

### 5.2 Screen-share understanding ⭐ (strong differentiator)
- **What:** The agent watches a shared screen/slides/code and can comment or answer about it.
- **Why:** Vision Agents has **vision** capability you're not using yet; almost no competitor does this well.
- **How:** Extend `agent-worker/main.py` to subscribe to the screen-share track and feed frames to the Gemini Live model.
- **Effort:** L · **Depends on:** Vision Agents vision support.

### 5.3 In-call "ask the AI" via chat (no speaking)
- **What:** A text sidebar to the agent during the call for people who can't/won't talk.
- **Effort:** M · **Depends on:** none.

### 5.4 Multilingual: language & voice selection
- **What:** Per-agent language and voice; transcription language is already configurable (`procedures.ts` sets `transcription.language: 'en'`).
- **Why:** Opens non-English markets.
- **Effort:** M · **Depends on:** none.

---

## Tier 6 — Smarter, more configurable agents

### 6.1 Agent knowledge base (per-agent RAG)
- **What:** Upload documents an agent can reference (e.g., a Sales agent that knows the product, an Interviewer agent that knows the JD/resume).
- **Why:** Turns generic agents into experts; big quality jump in live answers.
- **How:** File upload + embeddings (reuse 2.1 infra) scoped to an agent; inject retrieved context into the worker's `instructions`/turns.
- **Effort:** L · **Depends on:** 2.1 (embeddings infra).

### 6.2 Agent templates / marketplace
- **What:** Prebuilt agent personas: interviewer, sales coach, standup facilitator, language tutor, therapist-style listener, customer-discovery interviewer.
- **Why:** New users get value in one click instead of writing instructions from scratch.
- **How:** Seed a `templates` set; "Create from template" in `new-agent-dialog.tsx`.
- **Effort:** M · **Depends on:** none.

### 6.3 In-meeting tools / function calling
- **What:** Let the agent take actions mid-call (look up a CRM record, create a ticket, fetch a doc).
- **Why:** Moves from "talks" to "does."
- **How:** Add tool/function-calling to the worker's Gemini Live setup.
- **Effort:** L · **Depends on:** Vision Agents tool support.

### 6.4 Agent versioning & A/B
- **What:** Version agent instructions; compare outcomes across versions.
- **Effort:** M · **Depends on:** none.

---

## Suggested build order

1. **1.1 Action items** — highest wow-per-hour, reuses the exact summary pipeline.
2. **1.2 Decisions + 1.3 Chapters** — same pattern, compounding value per meeting.
3. **0.1 Reliable join + 0.2 observability** — harden before adding surface area.
4. **2.1 + 2.2 Search across meetings (RAG)** — the moat.
5. **3.1 Calendar auto-join** — makes it a daily driver.
6. **4.1 Organizations** — unlocks selling to teams (do before the archive grows large).
7. **5.2 Screen-share understanding** — a differentiator few competitors have.

> ⭐ = highest-impact within its tier.
