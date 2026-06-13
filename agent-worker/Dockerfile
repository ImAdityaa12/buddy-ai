# Buddy AI agent worker — Vision Agents + Gemini Live
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# Build deps for any packages that lack prebuilt wheels (aiortc/cffi, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so this layer is cached across code changes
COPY pyproject.toml uv.lock* ./
RUN uv sync --no-dev

# App code
COPY . .

# Hosts (Railway/Render/Fly) inject PORT; default to 8787 locally
ENV PORT=8787
EXPOSE 8787
CMD ["sh", "-c", "uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8787}"]
