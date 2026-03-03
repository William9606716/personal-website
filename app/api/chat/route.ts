import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import { retrieveChunksHybrid, type Chunk } from "@/lib/retrieval";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
  // Instantiate inside handler so env vars are available at runtime, not build time
  const doubao = createOpenAI({
    apiKey: process.env.VOLC_API_KEY,
    baseURL: process.env.VOLC_BASE_URL,
  });
  const { messages, sessionId } = await req.json();

  // Extract the last user message as the primary retrieval signal
  const lastUserMsg =
    [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user")?.content ?? "";

  // Detect follow-up questions by shortness or pronoun usage, and augment with
  // prior conversation turns so the retrieval query carries enough context
  const isFollowUp =
    lastUserMsg.length < 60 ||
    /\b(he|she|they|his|her|it|that|this|there|those|these|which|who)\b/i.test(
      lastUserMsg
    );

  const retrievalQuery = isFollowUp
    ? messages
        .slice(-4, -1)
        .map((m: { content: string }) => m.content)
        .join(" ") +
      " " +
      lastUserMsg
    : lastUserMsg;

  // HyDE: generate a short hypothetical answer and embed it instead of the raw
  // question. Hypothetical answers embed much closer to real document chunks.
  let hydeDoc = lastUserMsg;
  try {
    const hydeResult = await generateText({
      model: doubao.chat(process.env.DOUBAO_CHAT_MODEL!),
      prompt: `Given a question about a software engineer's portfolio, write a concise 2-sentence answer that such a portfolio might contain. Question: "${lastUserMsg}"`,
      maxOutputTokens: 80,
    });
    hydeDoc = hydeResult.text;
  } catch (e) {
    console.error("HyDE generation failed, falling back to raw query:", e);
  }

  // Hybrid search: vector similarity on the HyDE doc + BM25 on the raw query
  let chunks: Chunk[] = [];
  try {
    chunks = await retrieveChunksHybrid(hydeDoc, retrievalQuery, 8, 0.2);
  } catch (e) {
    console.error("Retrieval failed, continuing without context:", e);
  }

  const contextBlock =
    chunks.length > 0
      ? chunks.map((c) => `[Source: ${c.source}]\n${c.content}`).join("\n---\n")
      : "No relevant context found.";

  const systemPrompt = `You are William Peng, an experienced software and machine learning engineer. You are chatting directly with visitors on your personal portfolio website.
Your goal is to provide a friendly, genuine, and conversational experience. Keep your answers natural, punchy, and concise (< 100 words).

### Core Instructions:
* Fully Embody the Persona: You are William Peng. Always use "I", "me", and "my" when discussing experiences, projects, education, and skills. Do not introduce yourself as an AI assistant.
* Tone: Keep it formal and professional, but avoid stiff corporate speak. Avoid being hyperexcited.
* Distinguish Personal vs. General Knowledge: For questions about my background, career, education, or projects, rely on the <context> tags below. Never invent or assume personal details. However, if the user makes small talk, asks general questions, or wants tech concepts explained, draw on your broader knowledge to answer naturally as an experienced developer.
* The "I Don't Know" Rule: If a user asks a personal question not covered in your context, do not make up information, and DO NOT say "That information isn't in my portfolio" or "I am an AI and don't know." Instead, handle it casually like a real person dodging a question (e.g., "Haha, I haven't really put that on my site yet! But what I am focusing on right now is..." or "Good question, but I like to keep my site focused on my work. Speaking of which...").
* No Robotic Phrases: Never say things like "According to my context," "As a language model," or "Here are three bullet points." Weave your experiences into the chat organically ("When I was working at [Company]...").
* Keep It Snappy: Real people don't monologue. Answer directly, and keep responses concise, highly readable, and professional. Avoid dumping massive walls of text or reading off bullet points.

<context>
${contextBlock}
</context>`;

  // Cap message history sent to the LLM to avoid runaway token usage
  const llmMessages = messages.slice(-20);

  const result = streamText({
    model: doubao.chat(process.env.DOUBAO_CHAT_MODEL!),
    system: systemPrompt,
    messages: llmMessages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        for await (const chunk of result.textStream) {
          fullText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        // Insert chat log server-side (errors visible in server logs)
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { error } = await supabase.from("chat_logs").insert({
            session_id: sessionId ?? "anonymous",
            user_message: lastUserMsg,
            assistant_message: fullText,
            retrieved_chunks: chunks,
          });
          if (error) console.error("Chat log insert error:", error);
        } catch (e) {
          console.error("Chat log failed:", e);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  } catch (e) {
    console.error("Chat handler error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
