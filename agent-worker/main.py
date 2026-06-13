"""
Buddy AI — agent worker.

Runs the in-meeting AI agent using Stream's Vision Agents framework with the
Gemini Live (speech-to-speech) model. Replaces the old Stream JS OpenAI-realtime
edge, which only speaks OpenAI's removed beta protocol.

The Next.js webhook (`/api/webhook`, on `call.session_started`) POSTs to `/join`
with the call + agent details, and this worker joins that Stream call over WebRTC.

Run (from this folder):  uv run uvicorn main:app --port 8787
"""

import asyncio
import logging
import os

from dotenv import load_dotenv

# Reuse the Next.js app's .env (one source of truth) plus an optional local one.
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Vision Agents reads STREAM_API_KEY / STREAM_API_SECRET / GOOGLE_API_KEY.
# Map them from the names the Next.js app already uses so nothing is duplicated.
os.environ.setdefault("STREAM_API_KEY", os.getenv("NEXT_PUBLIC_STREAM_VIDEO_API_KEY", ""))
os.environ.setdefault("STREAM_API_SECRET", os.getenv("STREAM_VIDEO_API_SECRET", ""))
os.environ.setdefault("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY", ""))

from fastapi import FastAPI  # noqa: E402
from pydantic import BaseModel  # noqa: E402
from vision_agents.core import Agent, User  # noqa: E402
from vision_agents.plugins import gemini, getstream  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("agent-worker")

app = FastAPI(title="Buddy AI Agent Worker")

# Keep references to running agent tasks so they aren't garbage-collected.
_running: set[asyncio.Task] = set()


class JoinRequest(BaseModel):
    call_id: str
    agent_id: str
    call_type: str = "default"
    agent_name: str = "AI Agent"
    instructions: str = (
        "You are a helpful AI assistant in a live video meeting. "
        "Keep replies short, natural, and conversational."
    )


async def run_agent(req: JoinRequest) -> None:
    logger.info("agent joining call %s (agent=%s)", req.call_id, req.agent_id)
    try:
        agent = Agent(
            edge=getstream.Edge(),
            agent_user=User(name=req.agent_name, id=req.agent_id),
            instructions=req.instructions,
            llm=gemini.Realtime(),  # free-tier Gemini Live speech-to-speech
        )
        call = await agent.create_call(req.call_type, req.call_id)
        async with agent.join(call):
            await agent.simple_response("Briefly greet the participant and offer to help.")
            await agent.finish()  # blocks until the call ends
        logger.info("agent left call %s", req.call_id)
    except Exception:
        logger.exception("agent crashed for call %s", req.call_id)


@app.post("/join")
async def join(req: JoinRequest):
    # Fire-and-forget: the agent stays in the call until it ends.
    task = asyncio.create_task(run_agent(req))
    _running.add(task)
    task.add_done_callback(_running.discard)
    return {"status": "joining", "call_id": req.call_id}


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {
        "status": "ok",
        "stream_key": bool(os.getenv("STREAM_API_KEY")),
        "stream_secret": bool(os.getenv("STREAM_API_SECRET")),
        "google_key": bool(os.getenv("GOOGLE_API_KEY")),
        "active_agents": len(_running),
    }
