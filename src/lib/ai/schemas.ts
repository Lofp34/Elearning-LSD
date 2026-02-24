import { getModuleContentKey } from "@/lib/learning/base-structure";

export type InterviewAnalysisResult = {
  companyTone: string;
  audienceProfile: string;
  vocabularyToUse: string[];
  vocabularyToAvoid: string[];
  frequentObjections: string[];
  adaptationNotes: string[];
};

export type GeneratedModuleScript = {
  partKey: string;
  chapterKey: string;
  title: string;
  scriptText: string;
};

export type ModuleScriptsResult = {
  modules: GeneratedModuleScript[];
};

export type GeneratedQuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type GeneratedModuleQuiz = {
  partKey: string;
  chapterKey: string;
  questions: GeneratedQuizQuestion[];
};

export type ModuleQuizResult = {
  modules: GeneratedModuleQuiz[];
};

export const interviewAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    companyTone: { type: "string" },
    audienceProfile: { type: "string" },
    vocabularyToUse: {
      type: "array",
      items: { type: "string" },
    },
    vocabularyToAvoid: {
      type: "array",
      items: { type: "string" },
    },
    frequentObjections: {
      type: "array",
      items: { type: "string" },
    },
    adaptationNotes: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "companyTone",
    "audienceProfile",
    "vocabularyToUse",
    "vocabularyToAvoid",
    "frequentObjections",
    "adaptationNotes",
  ],
} as const;

export const moduleScriptsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          partKey: { type: "string" },
          chapterKey: { type: "string" },
          title: { type: "string" },
          scriptText: { type: "string" },
        },
        required: ["partKey", "chapterKey", "title", "scriptText"],
      },
    },
  },
  required: ["modules"],
} as const;

export const moduleQuizSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          partKey: { type: "string" },
          chapterKey: { type: "string" },
          questions: {
            type: "array",
            minItems: 5,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                question: { type: "string" },
                options: {
                  type: "array",
                  minItems: 4,
                  maxItems: 4,
                  items: { type: "string" },
                },
                answerIndex: { type: "integer", minimum: 0, maximum: 3 },
              },
              required: ["question", "options", "answerIndex"],
            },
          },
        },
        required: ["partKey", "chapterKey", "questions"],
      },
    },
  },
  required: ["modules"],
} as const;

function assertString(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${label}.`);
  }
  return value.trim();
}

function assertStringArray(value: unknown, label: string) {
  if (!Array.isArray(value)) throw new Error(`Invalid ${label}.`);
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
  if (cleaned.length === 0) throw new Error(`Invalid ${label}.`);
  return cleaned;
}

export function validateInterviewAnalysisPayload(payload: unknown): InterviewAnalysisResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid interview analysis payload.");
  }

  const row = payload as Record<string, unknown>;

  return {
    companyTone: assertString(row.companyTone, "companyTone"),
    audienceProfile: assertString(row.audienceProfile, "audienceProfile"),
    vocabularyToUse: assertStringArray(row.vocabularyToUse, "vocabularyToUse"),
    vocabularyToAvoid: assertStringArray(row.vocabularyToAvoid, "vocabularyToAvoid"),
    frequentObjections: assertStringArray(row.frequentObjections, "frequentObjections"),
    adaptationNotes: assertStringArray(row.adaptationNotes, "adaptationNotes"),
  };
}

function validateModuleKeys(modules: Array<{ partKey: string; chapterKey: string }>, expectedKeys: string[]) {
  const expected = new Set(expectedKeys);
  const received = new Set<string>();

  for (const moduleItem of modules) {
    const contentKey = getModuleContentKey(moduleItem.partKey, moduleItem.chapterKey);
    if (!expected.has(contentKey)) {
      throw new Error(`Unexpected module in AI response: ${contentKey}`);
    }
    if (received.has(contentKey)) {
      throw new Error(`Duplicate module in AI response: ${contentKey}`);
    }
    received.add(contentKey);
  }

  if (received.size !== expected.size) {
    const missing = expectedKeys.filter((key) => !received.has(key));
    throw new Error(`Missing modules in AI response: ${missing.join(", ")}`);
  }
}

export function validateModuleScriptsPayload(
  payload: unknown,
  expectedModuleKeys: string[]
): ModuleScriptsResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid module scripts payload.");
  }

  const row = payload as Record<string, unknown>;
  if (!Array.isArray(row.modules)) {
    throw new Error("Invalid module scripts payload: modules array missing.");
  }

  const modules = row.modules.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid module scripts item at index ${index}.`);
    }
    const moduleItem = item as Record<string, unknown>;
    const partKey = assertString(moduleItem.partKey, `modules[${index}].partKey`);
    const chapterKey = assertString(moduleItem.chapterKey, `modules[${index}].chapterKey`);
    const title = assertString(moduleItem.title, `modules[${index}].title`);
    const scriptText = assertString(moduleItem.scriptText, `modules[${index}].scriptText`);

    return { partKey, chapterKey, title, scriptText };
  });

  validateModuleKeys(modules, expectedModuleKeys);
  return { modules };
}

export function validateModuleQuizPayload(payload: unknown, expectedModuleKeys: string[]): ModuleQuizResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid module quiz payload.");
  }

  const row = payload as Record<string, unknown>;
  if (!Array.isArray(row.modules)) {
    throw new Error("Invalid module quiz payload: modules array missing.");
  }

  const modules = row.modules.map((item, moduleIndex) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid quiz module at index ${moduleIndex}.`);
    }
    const moduleItem = item as Record<string, unknown>;
    const partKey = assertString(moduleItem.partKey, `quiz.modules[${moduleIndex}].partKey`);
    const chapterKey = assertString(moduleItem.chapterKey, `quiz.modules[${moduleIndex}].chapterKey`);

    if (!Array.isArray(moduleItem.questions) || moduleItem.questions.length !== 5) {
      throw new Error(`Module ${partKey}.${chapterKey} must contain exactly 5 questions.`);
    }

    const questions = moduleItem.questions.map((raw, qIndex) => {
      if (!raw || typeof raw !== "object") {
        throw new Error(`Invalid question for module ${partKey}.${chapterKey} at index ${qIndex}.`);
      }
      const question = raw as Record<string, unknown>;
      const text = assertString(question.question, `question[${qIndex}].question`);
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error(`Question ${qIndex + 1} for module ${partKey}.${chapterKey} must have 4 options.`);
      }
      const options = question.options.map((option, optionIndex) =>
        assertString(option, `question[${qIndex}].options[${optionIndex}]`)
      );
      const answerIndex = Number(question.answerIndex);
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        throw new Error(`Question ${qIndex + 1} for module ${partKey}.${chapterKey} has invalid answerIndex.`);
      }

      return {
        question: text,
        options,
        answerIndex,
      };
    });

    return {
      partKey,
      chapterKey,
      questions,
    };
  });

  validateModuleKeys(modules, expectedModuleKeys);
  return { modules };
}
