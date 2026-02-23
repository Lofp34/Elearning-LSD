type NonEmptyString = string & { __brand: "NonEmptyString" };

function asNonEmpty(value: string | undefined, key: string): NonEmptyString {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return trimmed as NonEmptyString;
}

export function getRequiredEnv(key: string): NonEmptyString {
  return asNonEmpty(process.env[key], key);
}

export function getOptionalEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : null;
}

export function getBooleanEnv(key: string, defaultValue = false): boolean {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

export function getAiPipelineEnv() {
  return {
    openAiApiKey: getRequiredEnv("OPENAI_API_KEY"),
    openAiModelAnalysis: getRequiredEnv("OPENAI_MODEL_ANALYSIS"),
    openAiModelGeneration: getRequiredEnv("OPENAI_MODEL_GENERATION"),
    openAiWebhookSecret: getRequiredEnv("OPENAI_WEBHOOK_SECRET"),
    elevenLabsApiKey: getRequiredEnv("ELEVENLABS_API_KEY"),
    elevenLabsModelId: getRequiredEnv("ELEVENLABS_MODEL_ID"),
    appBaseUrl: getRequiredEnv("APP_BASE_URL"),
    cronSecret: getRequiredEnv("CRON_SECRET"),
  };
}
