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
