import { describe, expect, it } from "vitest";
import { BASE_MODULES, getModuleContentKey } from "@/lib/learning/base-structure";

describe("BASE_MODULES", () => {
  it("keeps exactly 16 fixed modules", () => {
    expect(BASE_MODULES).toHaveLength(16);
  });

  it("has unique content keys", () => {
    const keys = BASE_MODULES.map((module) => getModuleContentKey(module.partKey, module.chapterKey));
    expect(new Set(keys).size).toBe(16);
  });
});
