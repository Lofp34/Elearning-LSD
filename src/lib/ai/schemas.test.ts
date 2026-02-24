import { describe, expect, it } from "vitest";
import {
  validateInterviewAnalysisPayload,
  validateModuleQuizPayload,
  validateModuleScriptsPayload,
} from "@/lib/ai/schemas";

describe("AI schema validators", () => {
  const expectedModuleKeys = ["mental.posture-service", "mental.confiance-calme"];

  it("validates interview analysis payload", () => {
    const payload = validateInterviewAnalysisPayload({
      companyTone: "Calme",
      audienceProfile: "Debutants",
      vocabularyToUse: ["ecoute", "clarte"],
      vocabularyToAvoid: ["jargon"],
      frequentObjections: ["prix"],
      adaptationNotes: ["donner des exemples simples"],
    });

    expect(payload.companyTone).toBe("Calme");
    expect(payload.vocabularyToUse).toContain("ecoute");
  });

  it("validates module scripts strict keys", () => {
    const payload = validateModuleScriptsPayload(
      {
        modules: [
          {
            partKey: "mental",
            chapterKey: "posture-service",
            title: "Posture service",
            scriptText: "x".repeat(500),
          },
          {
            partKey: "mental",
            chapterKey: "confiance-calme",
            title: "Confiance calme",
            scriptText: "x".repeat(500),
          },
        ],
      },
      expectedModuleKeys
    );

    expect(payload.modules).toHaveLength(2);
  });

  it("validates quiz with 5 questions and 4 options", () => {
    const payload = validateModuleQuizPayload(
      {
        modules: [
          {
            partKey: "mental",
            chapterKey: "posture-service",
            questions: Array.from({ length: 5 }).map((_, i) => ({
              question: `Q${i + 1}`,
              options: ["A", "B", "C", "D"],
              answerIndex: 1,
            })),
          },
          {
            partKey: "mental",
            chapterKey: "confiance-calme",
            questions: Array.from({ length: 5 }).map((_, i) => ({
              question: `Q${i + 1}`,
              options: ["A", "B", "C", "D"],
              answerIndex: 2,
            })),
          },
        ],
      },
      expectedModuleKeys
    );

    expect(payload.modules[0].questions).toHaveLength(5);
  });
});
