/**
 * One-time seeding script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Prerequisites:
 *   1. Set env vars in .env.local (loaded automatically via dotenv below)
 *   2. Run the Supabase SQL setup (see README or plan doc)
 *   3. Put PDF files in ./docs/ directory for external document ingestion
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter, MarkdownTextSplitter } from "@langchain/textsplitters";
// pdf-parse has no named export — use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const volc = new OpenAI({
  apiKey: process.env.VOLC_API_KEY ?? (() => { throw new Error("VOLC_API_KEY is required"); })(),
  baseURL: process.env.VOLC_BASE_URL,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function embed(text: string): Promise<number[]> {
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

interface ChunkRow {
  content: string;
  source: string;
  category: string;
  embedding: number[];
}

async function upsertBatch(rows: ChunkRow[]) {
  const { error } = await supabase.from("portfolio_chunks").insert(rows);
  if (error) throw new Error(`Supabase upsert error: ${error.message}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embedAndUpsertBatches(
  chunks: { content: string; source: string; category: string }[],
  batchSize = 50
) {
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const rows: ChunkRow[] = [];
    for (const c of batch) {
      rows.push({ ...c, embedding: await embed(c.content) });
      await sleep(200); // avoid 429s from the embedding endpoint
    }
    await upsertBatch(rows);
    console.log(
      `  Upserted ${Math.min(i + batchSize, chunks.length)} / ${chunks.length} chunks`
    );
  }
}

// ---------------------------------------------------------------------------
// Portfolio data — treated as pre-formed chunks (no splitting needed)
// ---------------------------------------------------------------------------

// Dynamic imports so this script doesn't need tsconfig paths resolution
// We read the compiled JS from dist or use ts-node; with tsx this works fine.
async function collectPortfolioChunks(): Promise<
  { content: string; source: string; category: string }[]
> {
  // Import data modules directly
  const { experience } = await import("../data/experience");
  const { education } = await import("../data/education");
  const { projects } = await import("../data/projects");
  const { skills } = await import("../data/skills");

  const chunks: { content: string; source: string; category: string }[] = [];

  // Experience
  for (const item of experience) {
    const text = [
      `Company: ${item.company}`,
      `Role: ${item.role}`,
      `Period: ${item.startDate} – ${item.endDate}`,
      `Location: ${item.location}`,
      "Responsibilities:",
      ...item.bullets.map((b) => `- ${b}`),
    ].join("\n");
    chunks.push({ content: text, source: item.company, category: "experience" });
  }

  // Education
  for (const item of education) {
    const text = [
      `School: ${item.school}`,
      item.degree ? `Degree: ${item.degree}` : "",
      `Period: ${item.startDate} – ${item.endDate}`,
      "Details:",
      ...item.bullets.map((b) => `- ${b}`),
    ]
      .filter(Boolean)
      .join("\n");
    chunks.push({ content: text, source: item.school, category: "education" });
  }

  // Projects
  for (const item of projects) {
    const text = [
      `Project: ${item.title}`,
      item.institution ? `Institution: ${item.institution}` : "",
      `Description: ${item.description}`,
      `Technologies: ${item.tech.join(", ")}`,
      item.liveUrl ? `Link: ${item.liveUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    chunks.push({ content: text, source: item.title, category: "project" });
  }

  // Skills
  const skillText = skills
    .map((g) => `${g.category}: ${g.skills.join(", ")}`)
    .join("\n");
  chunks.push({ content: skillText, source: "skills", category: "skill" });

  return chunks;
}

// ---------------------------------------------------------------------------
// External documents (PDFs from ./docs/)
// ---------------------------------------------------------------------------

async function collectDocChunks(): Promise<
  { content: string; source: string; category: string }[]
> {
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) {
    console.log("  No docs/ directory found — skipping external documents.");
    return [];
  }

  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".pdf") || f.endsWith(".md"));
  if (files.length === 0) {
    console.log("  No PDF or Markdown files found in docs/ — skipping.");
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
    separators: ["\n\n", "\n", ". ", " "],
  });
  const mdSplitter = new MarkdownTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });

  const chunks: { content: string; source: string; category: string }[] = [];

  for (const file of files) {
    console.log(`  Parsing ${file}…`);
    let rawText: string;
    if (file.endsWith(".pdf")) {
      const buffer = fs.readFileSync(path.join(docsDir, file));
      const { text } = await pdfParse(buffer);
      rawText = text;
    } else {
      rawText = fs.readFileSync(path.join(docsDir, file), "utf-8");
    }
    // Strip null bytes and lone surrogates that Postgres rejects
    const cleanText = rawText.replace(/\u0000/g, "").replace(/[\uD800-\uDFFF]/g, "");
    const activeSplitter = file.endsWith(".md") ? mdSplitter : splitter;
    const splitChunks = await activeSplitter.createDocuments([cleanText]);
    for (const c of splitChunks) {
      chunks.push({
        content: c.pageContent.replace(/\u0000/g, "").replace(/[\uD800-\uDFFF]/g, ""),
        source: file,
        category: "doc",
      });
    }
    console.log(`  → ${splitChunks.length} chunks from ${file}`);
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Seeding portfolio_chunks ===\n");

  // Clear existing rows so re-runs are idempotent
  console.log("Clearing existing rows…");
  const { error: delError } = await supabase
    .from("portfolio_chunks")
    .delete()
    .neq("id", 0);
  if (delError) throw new Error(`Delete error: ${delError.message}`);

  // Portfolio data
  console.log("\nCollecting portfolio data…");
  const portfolioChunks = await collectPortfolioChunks();
  console.log(`  ${portfolioChunks.length} portfolio chunks`);
  await embedAndUpsertBatches(portfolioChunks);

  // External docs
  console.log("\nCollecting external documents…");
  const docChunks = await collectDocChunks();
  if (docChunks.length > 0) {
    console.log(`  ${docChunks.length} doc chunks`);
    await embedAndUpsertBatches(docChunks);
  }

  const total = portfolioChunks.length + docChunks.length;
  console.log(`\nDone! Seeded ${total} chunks total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
