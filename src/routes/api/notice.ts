import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const INSTRUCTIONS = `You help families understand notices from US jails and prisons (mail rejections, visitation changes, disciplinary notices, transfers, commissary/phone policy changes, release paperwork).
Read the notice the family pasted or photographed and reply in warm, plain language (about 8th-grade level). Use exactly these sections with bold headings:
**What this means** — 2–4 short sentences.
**Deadlines** — bullet list of every date or time limit in the notice, with what must happen by then. If none, say "No deadlines found in this notice." Never invent dates; if a deadline is relative (e.g. "within 15 days of receipt"), say so and help them count.
**Next steps** — numbered list of 2–5 concrete actions.
**Words to know** — explain any official terms used (skip if none).
Never invent phone numbers, addresses or rule numbers. If the text is unreadable or not a facility notice, say so kindly. You are not a lawyer; for appeals or legal issues, suggest legal aid or a public defender. Keep it under about 300 words.`;

export const Route = createFileRoute("/api/notice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        let body: { messages?: UIMessage[] };
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
        const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
        if (messages.length === 0) return Response.json({ error: "Paste or upload a notice first." }, { status: 400 });
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          INSTRUCTIONS,
        );
        return call.response();
      },
    },
  },
});
