import OpenAI from "openai";

export const runtime = "nodejs";

const SYSTEM = `You are "IRS Debt AI"—a friendly, accurate guide for US taxpayers with back taxes,
notices, liens, wage garnishments, or installment-agreement questions.
- You are NOT a lawyer or CPA; include a short disclaimer when advice could be legal/financial.
- Use a positive, uplifting tone: "Don't worry—we'll solve this together."
- Prefer plain English and actionable steps; link to official IRS pages when appropriate.
- Never ask for SSNs or IRS/Login.gov credentials; users must submit via the official IRS site.`;

export async function POST(req) {
  const { messages } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const resp = await openai.responses.stream({
          model: "gpt-4.1-mini",
          input: [
            { role: "system", content: SYSTEM },
            ...messages,
          ],
          max_output_tokens: 900,
          temperature: 0.3,
        });

        resp.on("message", (msg) => {
          if (msg.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: msg.delta })}\n\n`));
          }
          if (msg.type === "response.completed") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
          }
        });

        resp.on("error", (_err) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "stream_error" })}\n\n`));
          controller.close();
        });

        resp.start();
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "server_error" })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
