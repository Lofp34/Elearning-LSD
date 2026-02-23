import { getAiPipelineEnv } from "@/lib/env";

type ElevenLabsVoice = {
  voice_id: string;
  name: string;
};

export async function listElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  const env = getAiPipelineEnv();
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": env.elevenLabsApiKey },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs voices error ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as { voices?: ElevenLabsVoice[] };
  return payload.voices ?? [];
}

type SynthesizeParams = {
  text: string;
  voiceId: string;
  modelId?: string;
};

export async function synthesizeWithElevenLabs(params: SynthesizeParams): Promise<ArrayBuffer> {
  const env = getAiPipelineEnv();
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(params.voiceId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": env.elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: params.text,
        model_id: params.modelId ?? env.elevenLabsModelId,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs synthesis error ${response.status}: ${body}`);
  }

  return response.arrayBuffer();
}
