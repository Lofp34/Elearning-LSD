import { getOpenAiEnv } from "@/lib/env";
import { callOpenAiWithJsonSchema } from "@/lib/ai/openai-client";
import {
  interviewAnalysisSchema,
  moduleQuizSchema,
  moduleScriptsSchema,
  validateInterviewAnalysisPayload,
  validateModuleQuizPayload,
  validateModuleScriptsPayload,
} from "@/lib/ai/schemas";
import { prisma } from "@/lib/prisma";
import { BASE_MODULES, getModuleContentKey } from "@/lib/learning/base-structure";
import { resolveVoiceSlot } from "@/lib/pipeline/voice-assignment";

const MAX_INTERVIEW_CORPUS_CHARS = 120_000;

function buildInterviewCorpus(documents: Array<{ filename: string; extractedText: string | null }>) {
  const source = documents
    .map((document) => {
      const text = document.extractedText?.trim() ?? "";
      return `# ${document.filename}\n${text}`;
    })
    .join("\n\n");

  if (source.length <= MAX_INTERVIEW_CORPUS_CHARS) {
    return { corpus: source, truncated: false, sourceLength: source.length };
  }

  return {
    corpus: source.slice(0, MAX_INTERVIEW_CORPUS_CHARS),
    truncated: true,
    sourceLength: source.length,
  };
}

function assertScriptLengths(modules: Array<{ contentKey: string; scriptText: string }>) {
  for (const moduleItem of modules) {
    const length = moduleItem.scriptText.trim().length;
    if (length < 450 || length > 2200) {
      throw new Error(
        `Script length out of bounds for ${moduleItem.contentKey}: ${length} chars (expected 450..2200).`
      );
    }
  }
}

async function updateJobStep(jobId: string, step: string) {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { step },
  });
}

export async function executeFullPipelineJob(jobId: string) {
  const openAiEnv = getOpenAiEnv();

  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    include: {
      release: {
        select: {
          id: true,
          companyId: true,
          version: true,
          createdById: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!job || !job.release || !job.releaseId) {
    throw new Error("FULL_PIPELINE job requires a valid releaseId.");
  }

  const extractedInterviews = await prisma.interviewDocument.findMany({
    where: {
      companyId: job.companyId,
      status: "EXTRACTED",
      extractedText: { not: null },
    },
    select: {
      id: true,
      filename: true,
      extractedText: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (extractedInterviews.length === 0) {
    throw new Error("No extracted interviews found. Upload/extract at least one PDF first.");
  }

  const corpus = buildInterviewCorpus(extractedInterviews);
  const expectedModules = BASE_MODULES.map((module) => ({
    ...module,
    contentKey: getModuleContentKey(module.partKey, module.chapterKey),
  }));
  const expectedModuleKeys = expectedModules.map((module) => module.contentKey);

  await updateJobStep(jobId, "ANALYZING");

  const analysisRaw = await callOpenAiWithJsonSchema<unknown>({
    model: openAiEnv.openAiModelAnalysis,
    schemaName: "interview_analysis",
    schema: interviewAnalysisSchema,
    systemPrompt: [
      "Role: You are an expert learning designer for business training.",
      "Analyze interview transcripts from one company.",
      "Keep language accessible for non-sales learners.",
      "Return strict JSON only.",
    ].join("\n"),
    userPrompt: [
      `Company: ${job.company.name}`,
      `Interview documents: ${extractedInterviews.length}`,
      "Extract tone, vocabulary to use/avoid, objections, and adaptation notes.",
      "Interview corpus:",
      corpus.corpus,
    ].join("\n\n"),
  });

  const analysis = validateInterviewAnalysisPayload(analysisRaw);

  await prisma.learningRelease.update({
    where: { id: job.releaseId },
    data: {
      analysisSummary: {
        ...analysis,
        interviewCount: extractedInterviews.length,
        corpusLength: corpus.sourceLength,
        truncated: corpus.truncated,
      },
    },
  });

  await updateJobStep(jobId, "SCRIPTING");

  const scriptsRaw = await callOpenAiWithJsonSchema<unknown>({
    model: openAiEnv.openAiModelGeneration,
    schemaName: "module_scripts",
    schema: moduleScriptsSchema,
    systemPrompt: [
      "Role: You generate module scripts for a fixed 3-part learning structure.",
      "Adapt examples, vocabulary and objections to the company context.",
      "Do not add/remove modules.",
      "Use beginner-friendly language for non-sales learners.",
      "Return strict JSON only.",
    ].join("\n"),
    userPrompt: [
      `Company: ${job.company.name}`,
      "Fixed module structure (must be respected exactly):",
      JSON.stringify(expectedModules, null, 2),
      "Interview analysis:",
      JSON.stringify(analysis, null, 2),
    ].join("\n\n"),
  });

  const scriptsPayload = validateModuleScriptsPayload(scriptsRaw, expectedModuleKeys);
  const scriptsByKey = new Map(
    scriptsPayload.modules.map((module) => [
      getModuleContentKey(module.partKey, module.chapterKey),
      module,
    ])
  );

  assertScriptLengths(
    expectedModules.map((module) => ({
      contentKey: module.contentKey,
      scriptText: scriptsByKey.get(module.contentKey)?.scriptText ?? "",
    }))
  );

  await prisma.$transaction(async (tx) => {
    for (const expectedModule of expectedModules) {
      const generated = scriptsByKey.get(expectedModule.contentKey);
      if (!generated) {
        throw new Error(`Missing generated script for ${expectedModule.contentKey}.`);
      }

      await tx.learningModule.upsert({
        where: {
          releaseId_contentKey: { releaseId: job.releaseId!, contentKey: expectedModule.contentKey },
        },
        update: {
          title: generated.title,
          scriptText: generated.scriptText.trim(),
          orderIndex: expectedModule.orderIndex,
          partKey: expectedModule.partKey,
          chapterKey: expectedModule.chapterKey,
          voiceSlot: resolveVoiceSlot(expectedModule.orderIndex),
          reviewStatus: "DRAFT",
          reviewedAt: null,
          reviewedById: null,
          reviewComment: null,
        },
        create: {
          releaseId: job.releaseId!,
          partKey: expectedModule.partKey,
          chapterKey: expectedModule.chapterKey,
          contentKey: expectedModule.contentKey,
          title: generated.title,
          orderIndex: expectedModule.orderIndex,
          scriptText: generated.scriptText.trim(),
          voiceSlot: resolveVoiceSlot(expectedModule.orderIndex),
          reviewStatus: "DRAFT",
        },
      });
    }
  });

  await updateJobStep(jobId, "QUIZZING");

  const quizzesRaw = await callOpenAiWithJsonSchema<unknown>({
    model: openAiEnv.openAiModelGeneration,
    schemaName: "module_quizzes",
    schema: moduleQuizSchema,
    systemPrompt: [
      "Role: You generate validation quizzes for audio learning modules.",
      "Create exactly 5 MCQs per module.",
      "Each question must have exactly 4 options and one correct answer index [0..3].",
      "Return strict JSON only.",
    ].join("\n"),
    userPrompt: [
      `Company: ${job.company.name}`,
      "Modules and scripts:",
      JSON.stringify(
        expectedModules.map((module) => ({
          partKey: module.partKey,
          chapterKey: module.chapterKey,
          title: scriptsByKey.get(module.contentKey)?.title ?? module.title,
          scriptText: scriptsByKey.get(module.contentKey)?.scriptText ?? "",
        })),
        null,
        2
      ),
    ].join("\n\n"),
  });

  const quizzesPayload = validateModuleQuizPayload(quizzesRaw, expectedModuleKeys);
  const quizByKey = new Map(
    quizzesPayload.modules.map((module) => [
      getModuleContentKey(module.partKey, module.chapterKey),
      module,
    ])
  );

  await prisma.$transaction(async (tx) => {
    const releaseModules = await tx.learningModule.findMany({
      where: { releaseId: job.releaseId! },
      select: { id: true, contentKey: true },
    });

    const moduleByKey = new Map(releaseModules.map((module) => [module.contentKey, module]));

    for (const expected of expectedModules) {
      const currentModule = moduleByKey.get(expected.contentKey);
      if (!currentModule) {
        throw new Error(`Cannot find module ${expected.contentKey} in release ${job.releaseId}.`);
      }

      const quiz = quizByKey.get(expected.contentKey);
      if (!quiz || quiz.questions.length !== 5) {
        throw new Error(`Invalid quiz payload for ${expected.contentKey}.`);
      }

      await tx.learningQuizQuestion.deleteMany({ where: { moduleId: currentModule.id } });
      await tx.learningQuizQuestion.createMany({
        data: quiz.questions.map((question, index) => ({
          moduleId: currentModule.id,
          orderIndex: index + 1,
          question: question.question,
          options: question.options,
          answerIndex: question.answerIndex,
        })),
      });
    }

    await tx.learningRelease.update({
      where: { id: job.releaseId! },
      data: { status: "REVIEW_READY" },
    });
  });

  if (job.release.createdById) {
    await prisma.adminActionLog
      .create({
        data: {
          actorUserId: job.release.createdById,
          companyId: job.companyId,
          actionType: "PIPELINE_FULL_COMPLETED",
          metadata: {
            jobId,
            releaseId: job.releaseId,
            modules: expectedModules.length,
            interviews: extractedInterviews.length,
            truncatedCorpus: corpus.truncated,
          },
        },
      })
      .catch(() => null);
  }

  await updateJobStep(jobId, "REVIEW_READY");
}
