import { describe, expect, it } from "vitest";
import { sanitizeExtractedText } from "@/lib/interviews/pdf-extract";

describe("sanitizeExtractedText", () => {
  it("removes NUL bytes and control chars", () => {
    const input = "Bonjour\u0000 le\u0007 monde\n\n\tici";
    expect(sanitizeExtractedText(input)).toBe("Bonjour le monde ici");
  });

  it("collapses whitespace and trims", () => {
    const input = "   A   B   C   ";
    expect(sanitizeExtractedText(input)).toBe("A B C");
  });
});
