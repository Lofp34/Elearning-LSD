import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

async function getScopedModule(authUserId: string, releaseId: string, moduleId: string) {
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

  const learningModule = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    include: {
      release: {
        include: {
          company: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      },
      quizQuestions: {
        orderBy: { orderIndex: "asc" },
      },
      audioAsset: true,
    },
  });

  if (!learningModule || learningModule.releaseId !== releaseId) {
    return {
      error: NextResponse.json(
        { error: "Module introuvable pour cette release." },
        { status: 404 }
      ),
    };
  }

  const allowed = await canAccessCompany(authUser, learningModule.release.companyId);
  if (!allowed) {
    return { error: NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 }) };
  }

  return { authUser, learningModule };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ releaseId: string; moduleId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId, moduleId } = await params;
  const scoped = await getScopedModule(authUser.id, releaseId, moduleId);
  if ("error" in scoped) return scoped.error;

  return NextResponse.json({ module: scoped.learningModule });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ releaseId: string; moduleId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId, moduleId } = await params;
  const scoped = await getScopedModule(authUser.id, releaseId, moduleId);
  if ("error" in scoped) return scoped.error;

  const body = await request.json().catch(() => ({}));
  const scriptText =
    typeof body.scriptText === "string" ? body.scriptText.trim() : scoped.learningModule.scriptText;
  const moduleType =
    body.moduleType === "BONUS" || body.moduleType === "CORE"
      ? body.moduleType
      : scoped.learningModule.moduleType;

  let questions;
  try {
    questions = validateQuestions(body.questions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quiz invalide." },
      { status: 400 }
    );
  }

  if (scriptText.length < 120) {
    return NextResponse.json(
      { error: "Le script doit contenir au moins 120 caracteres." },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.learningModule.update({
      where: { id: moduleId },
      data: {
        scriptText,
        moduleType,
      },
    });

    await tx.learningQuizQuestion.deleteMany({
      where: { moduleId },
    });

    await tx.learningQuizQuestion.createMany({
      data: questions.map((question, index) => ({
        moduleId,
        orderIndex: index + 1,
        question: question.question,
        options: question.options,
        answerIndex: question.answerIndex,
      })),
    });

    await tx.adminActionLog.create({
      data: {
        actorUserId: authUser.id,
        companyId: scoped.learningModule.release.companyId,
        actionType: "MODULE_UPDATED",
        metadata: {
          releaseId,
          moduleId,
          moduleType,
          updatedQuiz: true,
          updatedScript: true,
        },
      },
    });
  });

  const updated = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    include: {
      quizQuestions: {
        orderBy: { orderIndex: "asc" },
      },
      audioAsset: true,
    },
  });

  return NextResponse.json({ ok: true, module: updated });
}
