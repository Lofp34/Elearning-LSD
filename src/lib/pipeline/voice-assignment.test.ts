import { describe, expect, it } from "vitest";
import { resolveVoiceId, resolveVoiceSlot } from "@/lib/pipeline/voice-assignment";

describe("voice assignment", () => {
  it("alternates voice slots deterministically", () => {
    expect(resolveVoiceSlot(1)).toBe("FEMALE");
    expect(resolveVoiceSlot(2)).toBe("MALE");
    expect(resolveVoiceSlot(3)).toBe("FEMALE");
    expect(resolveVoiceSlot(4)).toBe("MALE");
  });

  it("maps voice ids from slot", () => {
    const voices = { femaleVoiceId: "f1", maleVoiceId: "m1" };
    expect(resolveVoiceId(1, voices)).toBe("f1");
    expect(resolveVoiceId(2, voices)).toBe("m1");
  });
});
