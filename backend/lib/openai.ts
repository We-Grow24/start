import "server-only";
import OpenAI from "openai";

/**
 * Singleton OpenAI client for GPT-4o API.
 * Used by: Dreamer cron (library gap detection), Gamma QC agent (Simulation Matrix).
 */
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generates a text embedding using OpenAI text-embedding-3-small.
 * Used for Infinite Library semantic vibe search (pgvector HNSW index).
 *
 * @param text - Input text to embed
 * @returns number[] - 1536-dimensional embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0]!.embedding;
}

/**
 * Code generation for Agent Alpha — materialisation pipeline.
 * Generates code for individual DNA blocks.
 */
export async function generateBlockCode(
  blockType: string,
  blockProps: Record<string, unknown>,
  zoneType: string
): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `You are Agent Alpha, a code generation agent for the Svarnex platform. Generate production-quality React/Next.js component code for DNA blocks. Zone: ${zoneType}. Output ONLY the component code, no markdown fences.`,
      },
      {
        role: "user",
        content: `Generate a React component for a "${blockType}" DNA block with these props: ${JSON.stringify(blockProps)}`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
