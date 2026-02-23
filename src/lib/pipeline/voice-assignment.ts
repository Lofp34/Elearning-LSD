import { getVoiceSlotForOrder } from "@/lib/learning/base-structure";

export type VoiceSelection = {
  femaleVoiceId: string;
  maleVoiceId: string;
};

export function resolveVoiceSlot(orderIndex: number) {
  return getVoiceSlotForOrder(orderIndex);
}

export function resolveVoiceId(orderIndex: number, voices: VoiceSelection) {
  return resolveVoiceSlot(orderIndex) === "FEMALE" ? voices.femaleVoiceId : voices.maleVoiceId;
}
