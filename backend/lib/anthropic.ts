import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Singleton Anthropic client for Claude Sonnet API.
 * Used by: Oracle (user-facing chat), Alpha agent (DNA Blueprint design).
 */
export const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Streams an Oracle chat response from Claude Sonnet.
 * Returns an async iterable of text deltas.
 *
 * @param messages - Conversation history (system prompt injected separately)
 * @param systemPrompt - System prompt with project DNA context
 */
export async function* streamOracleChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): AsyncIterable<string> {
  const stream = anthropicClient.messages.stream({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Non-streaming Oracle call — returns full response text.
 * Used for DNA mutation proposals where streaming is unnecessary.
 */
export async function callOracle(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const response = await anthropicClient.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}
