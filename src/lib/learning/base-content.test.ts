import { describe, expect, it } from "vitest";
import { BASE_MODULES, getModuleContentKey } from "@/lib/learning/base-structure";
import { BASE_MODULE_CONTENT, listMissingBaseModuleContent } from "@/lib/learning/base-content";

describe("BASE_MODULE_CONTENT", () => {
  it("covers every fixed module in the learning structure", () => {
    expect(listMissingBaseModuleContent()).toEqual([]);
    expect(Object.keys(BASE_MODULE_CONTENT)).toHaveLength(BASE_MODULES.length);
  });

  it("provides five quiz questions per module", () => {
    for (const baseModule of BASE_MODULES) {
      const contentKey = getModuleContentKey(baseModule.partKey, baseModule.chapterKey);
      const content = BASE_MODULE_CONTENT[contentKey];
      expect(content).toBeDefined();
      expect(content.quizQuestions).toHaveLength(5);
    }
  });
});
