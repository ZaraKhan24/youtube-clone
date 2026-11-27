import express from "express";
import Video from "../models/Video.js";

const router = express.Router();

const SYSTEM_RULES = `
You are the assistant for this YouTube Clone web application.
Rules:
1. Only answer questions related to this YouTube Clone app (uploading, playing, deleting, or searching videos; login/signup; channels) and the uploaded videos listed in the context below.
2. When asked about uploaded or latest videos, share accurate titles, channel names, and descriptions from the provided video list.
3. If the user asks anything unrelated or irrelevant to this app or its videos, humbly decline in 1-2 polite sentences and invite them to ask about the app or uploaded videos.
4. Do NOT use raw Markdown asterisks like ** or * in your output. Write clean plain text and keep responses concise, accurate, and helpful.
`;

let cachedVideoContext = { text: "", expiresAt: 0 };

function splitRealKeys(rawValue) {
  if (!rawValue) return [];
  return String(rawValue)
    .split(",")
    .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
    .filter((k) => k && !k.toLowerCase().startsWith("your_"));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getVideoContextFast() {
  const now = Date.now();
  if (cachedVideoContext.text && cachedVideoContext.expiresAt > now) {
    return cachedVideoContext.text;
  }

  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .select("title description channelName")
      .lean()
      .maxTimeMS(2500);

    const text =
      !videos || videos.length === 0
        ? "No videos uploaded yet (0 videos)."
        : `Total recent videos: ${videos.length}\n` +
          videos
            .map(
              (v, idx) =>
                `${idx + 1}. Title: "${v.title}" | Channel: ${
                  v.channelName || "Creator"
                } | Description: ${v.description || "N/A"}`
            )
            .join("\n");

    cachedVideoContext = { text, expiresAt: now + 15000 };
    return text;
  } catch (err) {
    console.error("[ChatBot DB Warning]", err.message);
    return (
      cachedVideoContext.text ||
      "Uploaded video list is temporarily unavailable due to a database connection issue."
    );
  }
}

async function callOpenAiCompatible({
  url,
  apiKey,
  model,
  messages,
  extraHeaders = {},
  timeoutMs = 5500,
}) {
  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 220,
        temperature: 0.3,
      }),
    },
    timeoutMs
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`);
  }

  const text = (data?.choices?.[0]?.message?.content || "").trim();
  if (!text) {
    throw new Error("Empty response from model");
  }
  return text;
}

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const trimmedMessage = String(message || "").trim();

    if (!trimmedMessage) {
      return res.status(400).json({ message: "Message is required" });
    }

    const videoContext = await getVideoContextFast();
    const systemPrompt = `${SYSTEM_RULES}\n\nUploaded Videos Context:\n${videoContext}`;

    const safeHistory = Array.isArray(history)
      ? history.slice(-3).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 400),
        }))
      : [];

    const openAiMessages = [
      { role: "system", content: systemPrompt },
      ...safeHistory,
      { role: "user", content: trimmedMessage },
    ];

    const providers = [];

    for (const key of splitRealKeys(process.env.OPENROUTER_API_KEY)) {
      providers.push({
        name: "OpenRouter",
        run: () =>
          callOpenAiCompatible({
            url: "https://openrouter.ai/api/v1/chat/completions",
            apiKey: key,
            model: process.env.OPENROUTER_MODEL || "openrouter/free",
            messages: openAiMessages,
            extraHeaders: {
              "HTTP-Referer":
                process.env.APP_URL || "https://youtube-clone-indol-pi.vercel.app",
              "X-Title": "YouTube Clone Assistant",
            },
          }),
      });
    }

    for (const key of splitRealKeys(process.env.GROQ_API_KEY)) {
      providers.push({
        name: "Groq",
        run: () =>
          callOpenAiCompatible({
            url: "https://api.groq.com/openai/v1/chat/completions",
            apiKey: key,
            model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
            messages: openAiMessages,
          }),
      });
    }

    for (const key of splitRealKeys(process.env.XKIRO_API_KEY)) {
      providers.push({
        name: "xKiro",
        run: () =>
          callOpenAiCompatible({
            url: (
              process.env.XKIRO_API_URL || "https://api.xkiro.com/v1/chat/completions"
            ).replace(/\/+$/, ""),
            apiKey: key,
            model: process.env.XKIRO_MODEL || "qwen/qwen3.5-flash:free",
            messages: openAiMessages,
            timeoutMs: 6500,
          }),
      });
    }

    if (providers.length === 0) {
      return res.status(500).json({
        message:
          "AI assistant is not configured yet. Please add valid API keys in backend environment variables.",
      });
    }

    const errors = [];
    for (const provider of providers) {
      try {
        const reply = await provider.run();
        return res.json({ reply, provider: provider.name });
      } catch (err) {
        const errMsg = `${provider.name}: ${err.message}`;
        console.error("[ChatBot Provider Error]", errMsg);
        errors.push(errMsg);
      }
    }

    return res.status(502).json({
      message:
        "Assistant is temporarily busy or all configured AI keys reached their limit. Please try again in a moment.",
      details: errors,
    });
  } catch (err) {
    console.error("[ChatBot Route Error]", err.message);
    return res.status(500).json({
      message:
        "Unable to process your chat request right now. Please check the server or database connection.",
    });
  }
});

export default router;