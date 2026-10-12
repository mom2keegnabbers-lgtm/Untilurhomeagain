import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const INSTRUCTIONS = `You are Kindred's guide for families supporting someone who is incarcerated in the United States.
Topics: sending mail, commissary deposits, visits (in-person and video), and inmate phone/messaging accounts.
Rules:
- Use plain, warm, everyday language at about an 8th-grade reading level. No jargon; explain any official term you must use.
- Be facility-aware: if the family gave a facility or state, tailor the answer to that system (state DOC, federal BOP, or county jail) and name the likely vendor or official source (e.g. JPay, Access Corrections, GTL/ViaPath, Securus, TouchPay, BOP TRULINCS) only when you are reasonably confident. If unsure, say rules vary and tell them exactly what to check.
- Never invent specific phone numbers, addresses, fees, or rule numbers. Tell them where to verify (facility website, inmate handbook, mailroom, visitation office).
- Always finish with a short "Next steps" numbered list (2–5 concrete actions).
- Keep answers under about 250 words unless the family asks for more detail.
- You are not a lawyer; for legal questions, suggest a public defender, legal aid, or prisoner rights organization.`;

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        const { getAuthedContext } = await import("@/lib/session.server");
        const authed = await getAuthedContext(request);
        if (!authed) return Response.json({ error: "Please sign in to use the Ask helper." }, { status: 401 });
        const { userHasLifetime } = await import("@/lib/plan.server");
        if (!(await userHasLifetime(authed.userId)))
          return Response.json({ error: "The Ask helper is part of Kindred Lifetime ($4.99 once). Visit Plans to unlock it." }, { status: 402 });
        let body: { messages?: UIMessage[]; facility?: string; state?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
        if (messages.length === 0) return Response.json({ error: "Ask a question first." }, { status: 400 });
        const facility = String(body.facility ?? "").slice(0, 120).trim();
        const state = String(body.state ?? "").slice(0, 60).trim();
        const context = facility || state
          ? `\n\nFamily's facility: ${facility || "not given"}. State/system: ${state || "not given"}.`
          : "\n\nThe family has not said which facility; ask briefly if it would change the answer.";
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          INSTRUCTIONS + context,
        );
        return call.response();
      },
    },
  },
});
