import OpenAI from 'openai';

// Gemini exposes an OpenAI-compatible API, so we keep the OpenAI SDK and just
// point it at Gemini. Existing chat.completions.create() calls work unchanged.
export const geminiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// Fast, free-tier, 1M-token-context model — good for summaries and chat.
export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';
