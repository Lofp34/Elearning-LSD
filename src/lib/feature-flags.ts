import { getBooleanEnv } from "@/lib/env";

export function isNewContentEngineEnabled() {
  return getBooleanEnv("NEW_CONTENT_ENGINE", false);
}
