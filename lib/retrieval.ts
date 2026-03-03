import { createClient } from "@supabase/supabase-js";
import { getVolcClient } from "./volcengine";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${process.env.VOLC_BASE_URL}/embeddings/multimodal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOLC_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DOUBAO_EMBED_MODEL,
      input: [{ type: "text", text }],
    }),
  });
  if (!res.ok) throw new Error(`Embed error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.embedding;
}

export interface Chunk {
  content: string;
  source: string;
  category: string;
}

export async function retrieveChunks(
  query: string,
  topK = 10,
  matchThreshold = 0.2
): Promise<Chunk[]> {
  const embedding = await embedText(query);

  const { data, error } = await getSupabase().rpc("match_chunks", {
    query_embedding: embedding,
    match_count: topK,
    match_threshold: matchThreshold,
  });

  if (error) {
    console.error("Supabase retrieval error:", error);
    return [];
  }

  return (data ?? []) as Chunk[];
}

export async function retrieveChunksHybrid(
  embeddingText: string,
  keywordText: string,
  topK = 8,
  matchThreshold = 0.2
): Promise<Chunk[]> {
  const embedding = await embedText(embeddingText);

  const { data, error } = await getSupabase().rpc("match_chunks_hybrid", {
    query_embedding: embedding,
    query_text: keywordText,
    match_count: topK,
    match_threshold: matchThreshold,
  });

  if (error) {
    console.error("Hybrid retrieval error:", error);
    return retrieveChunks(embeddingText, topK, matchThreshold);
  }

  return (data ?? []) as Chunk[];
}
