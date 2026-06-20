# Deploying the agent worker to Hugging Face Spaces (free)

The worker is an **always-on Docker container**, not a serverless function. The
`uvicorn` process runs continuously; when `/join` fires it spawns a background
task that holds a WebRTC connection to Stream's SFU for the whole meeting. A free
Space only sleeps after ~48h of *zero* traffic — a live call is traffic, so it
never sleeps mid-call, and it wakes on the next request.

WebRTC works from inside HF's network because the worker is a **client dialing
out** to Stream's SFU, which supports TURN-over-TCP/443 fallback — so even if HF
blocks raw UDP, the agent still connects.

---

## 1. Create the Space

1. Sign up at https://huggingface.co (free, no credit card).
2. Go to https://huggingface.co/new-space.
   - **Owner**: your username
   - **Space name**: `buddy-ai-agent-worker`
   - **SDK**: **Docker** → **Blank**
   - **Visibility**: **Public** (free tier)
3. Create. You now have a git repo at
   `https://huggingface.co/spaces/<user>/buddy-ai-agent-worker`.

## 2. Add the secrets (NOT in code — Spaces are public)

Space → **Settings** → **Variables and secrets** → add three **Secrets**:

| Name | Value |
| --- | --- |
| `GOOGLE_API_KEY` | your Gemini API key |
| `STREAM_API_KEY` | value of `NEXT_PUBLIC_STREAM_VIDEO_API_KEY` |
| `STREAM_API_SECRET` | value of `STREAM_VIDEO_API_SECRET` |

`main.py` reads these directly (its `setdefault` mapping leaves them untouched
when already present), so no `.env` file is needed on the Space.

## 3. Push the worker code to the Space

The Space repo root must contain the `Dockerfile`, so push the **contents of this
`agent-worker/` folder** (not the whole monorepo). From a clean folder:

```bash
git clone https://huggingface.co/spaces/<user>/buddy-ai-agent-worker
cd buddy-ai-agent-worker

# copy these files from agent-worker/ into here:
#   Dockerfile  main.py  pyproject.toml  uv.lock  README.md  .dockerignore

git add .
git commit -m "Deploy Buddy AI agent worker"
git push
```

Auth for the push: when prompted for a password, paste a **Write** access token
from https://huggingface.co/settings/tokens (or run `huggingface-cli login` first).

> The `README.md` front-matter (`sdk: docker`, `app_port: 8787`) tells the Space
> to build the Dockerfile and route traffic to port 8787 — which the Dockerfile's
> `${PORT:-8787}` already binds. Nothing else to change.

## 4. Wait for the build, then verify

Watch the **Logs** tab build the image and start uvicorn. Once running, open:

```
https://<user>-buddy-ai-agent-worker.hf.space/health
```

`stream_key`, `stream_secret`, and `google_key` should all be `true`.

## 5. Point the Next.js app at it

Set this in the Next.js app's env (e.g. Vercel → Project → Settings → Environment
Variables), then redeploy:

```
AGENT_WORKER_URL=https://<user>-buddy-ai-agent-worker.hf.space
```

The webhook (`src/app/api/webhook/route.ts`) POSTs to `${AGENT_WORKER_URL}/join`
on `call.session_started`. That's the only app-side change.

## 6. (Optional) Keep it warm

To avoid a cold start on the first call after a long idle, ping `/health` every
few hours for free with https://cron-job.org or a GitHub Action:

```yaml
# .github/workflows/keep-warm.yml
name: keep-warm
on:
  schedule:
    - cron: "0 */6 * * *"   # every 6 hours
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS https://<user>-buddy-ai-agent-worker.hf.space/health
```

---

### Troubleshooting

- **Build fails on a permission/cache error** — add `ENV UV_CACHE_DIR=/app/.cache/uv`
  near the top of the `Dockerfile` (HF runs the container with a restricted user).
- **Agent joins but no audio** — check the Logs for `agent crashed`; usually a
  missing/!`true` secret on the `/health` check.
- **First call after days is missed** — the Space was asleep and cold-started;
  enable the keep-warm ping in step 6.
