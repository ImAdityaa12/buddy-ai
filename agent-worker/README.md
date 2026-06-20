---
title: Buddy AI Agent Worker
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 8787
pinned: false
---

# Buddy AI — Agent Worker

The in-meeting AI agent, running on Stream's [Vision Agents](https://github.com/GetStream/Vision-Agents)
framework with **Gemini Live** (free-tier speech-to-speech).

This replaces the old Stream JS OpenAI-realtime integration, which broke when
OpenAI removed its beta Realtime API (May 2026). Vision Agents joins the Stream
call directly over WebRTC and talks to Gemini's GA Live API.

## Why a separate service?

A realtime voice agent must stay connected for the whole call, so it can't live
in a Vercel serverless function. Vision Agents is also Python-only. So the agent
runs here as a small always-on worker; the Next.js app triggers it via HTTP.

## Setup

1. Install [`uv`](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager).
2. Get a **free** Gemini API key at https://aistudio.google.com/apikey
3. Add it to the **project root** `.env` (the file the Next.js app already uses):

   ```
   GEMINI_API_KEY=your_key_here
   ```

   Stream credentials (`NEXT_PUBLIC_STREAM_VIDEO_API_KEY`, `STREAM_VIDEO_API_SECRET`)
   are read from that same `.env` automatically — nothing to duplicate.

4. Install deps and run (from this `agent-worker/` folder):

   ```bash
   uv sync
   uv run uvicorn main:app --port 8787
   ```

5. Check it's healthy: open http://localhost:8787/health — `google_key`,
   `stream_key`, and `stream_secret` should all be `true`.

## How it connects to the app

`POST /join` is called by the Next.js webhook on `call.session_started`:

```jsonc
{
  "call_type": "default",
  "call_id": "<meetingId>",
  "agent_id": "<agent id>",
  "agent_name": "English Teacher",
  "instructions": "<agent instructions>"
}
```

The webhook reads the worker URL from `AGENT_WORKER_URL` (defaults to
`http://localhost:8787`). Set that env var in the Next.js app for production.

## Changing the model

Default is `gemini-3-flash-preview` (free tier). To use a different Gemini Live
model, edit `main.py`:

```python
llm=gemini.Realtime(model="gemini-2.5-flash-native-audio-preview-12-2025")
```
