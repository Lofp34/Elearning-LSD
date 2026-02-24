import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ReviewStatus = "DRAFT" | "APPROVED" | "NEEDS_CHANGES";

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "DRAFT" || value === "APPROVED" || value === "NEEDS_CHANGES";
}

function validateQuestions(value: unknown) {
  if (!Array.isArray(value) || value.length !== 5) {
    throw new Error("Le quiz doit contenir exactement 5 questions.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Question invalide a l'index ${index + 1}.`);
    }

    const row = item as Record<string, unknown>;
    const question = typeof row.question === "string" ? row.question.trim() : "";
    if (!question) {
      throw new Error(`Texte manquant pour la question ${index + 1}.`);
    }

    if (!Array.isArray(row.options) || row.options.length !== 4) {
      throw new Error(`La question ${index + 1} doit contenir 4 options.`);
    }

    const options = row.options.map((option, optionIndex) => {
      if (typeof option !== "string" || option.trim().length === 0) {
        throw new Error(`Option invalide pour Q${index + 1}, choix ${optionIndex + 1}.`);
      }
      return option.trim();
    });

    const answerIndex = Number(row.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      throw new Error(`Reponse correcte invalide pour la question ${index + 1}.`);
    }

    return {
      question,
      options,
      answerIndex,
    };
  });
}

async function getReleaseOr403(authUserId: string, releaseId: string) {
  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    select: {
      id: true,
      companyId: true,
      status: true,
      version: true,
    },
  });

  if (!release) {
    return { error: NextResponse.json({ error: "Release introuvable." }, { status: 404 }) };
  }

  const authUser = await prisma.user.findUnique({
    where: { id: authUserId },
    select: {
      id: true,
      role: true,
      companyId: true,
      company: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!authUser) {
    return { error: NextResponse.json({ error: "Non autorise." }, { status: 403 }) };
  }

  const allowed = await canAccessCompany(authUser, release.companyId);
  if (!allowed) {
    return { error: NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 }) };
  }

  return { release, authUser };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ releaseId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId } = await params;
  const scoped = await getReleaseOr403(authUser.id, releaseId);
  if ("error" in scoped) return scoped.error;

  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          quizQuestions: {
            orderBy: { orderIndex: "asc" },
          },
          audioAsset: {
            select: {
              id: true,
              status: true,
              blobPath: true,
              providerVoiceId: true,
            },
          },
          reviewedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ release });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ releaseId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId } = await params;
  const scoped = await getReleaseOr403(authUser.id, releaseId);
  if ("error" in scoped) return scoped.error;

  const body = await request.json().catch(() => ({}));
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
  const scriptText = typeof body.scriptText === "string" ? body.scriptText.trim() : null;
  const reviewStatus = body.reviewStatus;
  const reviewComment = typeof body.reviewComment === "string" ? body.reviewComment.trim() : null;

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId obligatoire." }, { status: 400 });
  }

  if (reviewStatus !== undefined && !isReviewStatus(reviewStatus)) {
    return NextResponse.json({ error: "reviewStatus invalide." }, { status: 400 });
  }

  let questions:
    | {
        question: string;
        options: string[];
        answerIndex: number;
      }[]
    | null = null;

  if (body.questions !== undefined) {
    try {
      questions = validateQuestions(body.questions);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Quiz invalide." },
        { status: 400 }
      );
    }
  }

  const learningModule = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      releaseId: true,
      contentKey: true,
      chapterKey: true,
      title: true,
    },
  });

  if (!learningModule || learningModule.releaseId !== releaseId) {
    return NextResponse.json({ error: "Module introuvable pour cette release." }, { status: 404 });
  }

  const updateData: {
    scriptText?: string;
    reviewStatus?: ReviewStatus;
    reviewComment?: string | null;
    reviewedAt?: Date;
    reviewedById?: string;
  } = {};

  if (scriptText !== null) {
    if (scriptText.length < 450 || scriptText.length > 2200) {
      return NextResponse.json(
        { error: "Le script doit contenir entre 450 et 2200 caracteres." },
        { status: 400 }
      );
    }
    updateData.scriptText = scriptText;
  }

  if (reviewStatus) {
    updateData.reviewStatus = reviewStatus;
  }

  if (reviewComment !== null) {
    updateData.reviewComment = reviewComment.length > 0 ? reviewComment : null;
  }

  if (reviewStatus || reviewComment !== null || scriptText !== null || questions) {
    updateData.reviewedAt = new Date();
    updateData.reviewedById = authUser.id;
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(updateData).length > 0) {
      await tx.learningModule.update({
        where: { id: moduleId },
        data: updateData,
      });
    }

    if (questions) {
      await tx.learningQuizQuestion.deleteMany({ where: { moduleId } });
      await tx.learningQuizQuestion.createMany({
        data: questions.map((question, index) => ({
          moduleId,
          orderIndex: index + 1,
          question: question.question,
          options: question.options,
          answerIndex: question.answerIndex,
        })),
      });
    }

    await tx.adminActionLog.create({
      data: {
        actorUserId: authUser.id,
        companyId: scoped.release.companyId,
        actionType: "RELEASE_REVIEW_UPDATED",
        metadata: {
          releaseId,
          moduleId,
          contentKey: learningModule.contentKey,
          updatedScript: scriptText !== null,
          updatedQuiz: Boolean(questions),
          reviewStatus: reviewStatus ?? null,
        },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
