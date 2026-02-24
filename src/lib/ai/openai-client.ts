import { getOpenAiEnv } from "@/lib/env";
import { randomUUID } from "node:crypto";

type JsonSchema = Record<string, unknown>;

type OpenAiJsonSchemaParams = {
  model?: string;
  schemaName: string;
  schema: JsonSchema;
  systemPrompt: string;
  userPrompt: string;
};

function extractTextPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const direct = (payload as { output_text?: unknown }).output_text;
  if (typeof direct === "string" && direct.trim().length > 0) return direct;

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") chunks.push(text);
    }
  }

  return chunks.length > 0 ? chunks.join("\n").trim() : null;
}

export async function callOpenAiWithJsonSchema<T>(params: OpenAiJsonSchemaParams): Promise<T> {
  const env = getOpenAiEnv();
  const idempotencyKey = randomUUID();

  const payloadBody = {
    model: params.model ?? env.openAiModelGeneration,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: params.systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: params.userPrompt }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: params.schemaName,
        schema: params.schema,
        strict: true,
      },
    },
  };

  let lastError: Error | null = null;
  let response: Response | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.openAiApiKey}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payloadBody),
        signal: controller.signal,
      });

      if (response.ok) break;

      const body = await response.text();
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === 3) {
        throw new Error(`OpenAI error ${response.status}: ${body}`);
      }
      lastError = new Error(`Retryable OpenAI error ${response.status}: ${body}`);
    } catch (error) {
      lastError = error as Error;
      if (attempt === 3) break;
    } finally {
      clearTimeout(timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }

  if (!response || !response.ok) {
    throw lastError ?? new Error("OpenAI request failed.");
  }

  const payload = await response.json();
  const jsonText = extractTextPayload(payload);
  if (!jsonText) {
    throw new Error("OpenAI returned no parsable JSON payload.");
  }

  return JSON.parse(jsonText) as T;
}
