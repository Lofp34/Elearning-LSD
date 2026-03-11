import type { AuthUserScope } from "@/lib/authz";
import { isSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export type ProgressReportRow = {
  companyName: string;
  companyId: string;
  releaseId: string;
  releaseVersion: number;
  userId: string;
  learnerName: string;
  learnerEmail: string;
  moduleId: string;
  moduleTitle: string;
  moduleType: string;
  partKey: string;
  orderIndex: number;
  listenPercentMax: number;
  completed: boolean;
  quizBestScore: number | null;
  quizBestTotal: number | null;
  quizPassed: boolean;
  lastActivityAt: Date | null;
};

function getCompanyWhere(authUser: AuthUserScope) {
  if (isSuperAdmin(authUser.role)) {
    return {};
  }

  if (authUser.companyId) {
    return { id: authUser.companyId };
  }

  if (authUser.company) {
    return { name: { equals: authUser.company, mode: "insensitive" as const } };
  }

  return { id: "__missing__" };
}

export async function getProgressReportRows(authUser: AuthUserScope) {
  const enrollments = await prisma.learnerEnrollment.findMany({
    where: {
      isActive: true,
      release: {
        company: getCompanyWhere(authUser),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      release: {
        select: {
          id: true,
          version: true,
          companyId: true,
          company: {
            select: {
              name: true,
            },
          },
          modules: {
            where: {
              moduleType: "CORE",
              audioAsset: {
                is: {
                  status: "GENERATED",
                },
              },
            },
            orderBy: {
              orderIndex: "asc",
            },
            select: {
              id: true,
              title: true,
              moduleType: true,
              partKey: true,
              orderIndex: true,
            },
          },
        },
      },
    },
  });

  const progress = await prisma.learnerModuleProgress.findMany({
    where: {
      release: {
        company: getCompanyWhere(authUser),
      },
    },
    select: {
      userId: true,
      releaseId: true,
      moduleId: true,
      listenPercentMax: true,
      completedAt: true,
      quizBestScore: true,
      quizBestTotal: true,
      quizPassed: true,
      lastListenedAt: true,
      quizPassedAt: true,
      updatedAt: true,
    },
  });

  const progressMap = new Map(
    progress.map((item) => [
      `${item.userId}:${item.releaseId}:${item.moduleId}`,
      item,
    ])
  );

  const latestAttempts = await prisma.quizAttempt.findMany({
    where: {
      release: {
        company: getCompanyWhere(authUser),
      },
      moduleId: {
        not: null,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      releaseId: true,
      moduleId: true,
      createdAt: true,
    },
  });

  const latestQuizActivity = new Map<string, Date>();
  for (const attempt of latestAttempts) {
    const moduleId = attempt.moduleId ?? "";
    if (!moduleId || !attempt.releaseId) continue;
    const key = `${attempt.userId}:${attempt.releaseId}:${moduleId}`;
    if (!latestQuizActivity.has(key)) {
      latestQuizActivity.set(key, attempt.createdAt);
    }
  }

  const rows: ProgressReportRow[] = [];
  for (const enrollment of enrollments) {
    const learnerName = `${enrollment.user.firstName} ${enrollment.user.lastName}`.trim();

    for (const learningModule of enrollment.release.modules) {
      const key = `${enrollment.user.id}:${enrollment.release.id}:${learningModule.id}`;
      const item = progressMap.get(key);
      const lastQuizAt = latestQuizActivity.get(key) ?? null;
      const lastActivityCandidates = [
        item?.lastListenedAt ?? null,
        item?.quizPassedAt ?? null,
        item?.updatedAt ?? null,
        lastQuizAt,
      ].filter((value): value is Date => value instanceof Date);

      rows.push({
        companyName: enrollment.release.company.name,
        companyId: enrollment.release.companyId,
        releaseId: enrollment.release.id,
        releaseVersion: enrollment.release.version,
        userId: enrollment.user.id,
        learnerName,
        learnerEmail: enrollment.user.email,
        moduleId: learningModule.id,
        moduleTitle: learningModule.title,
        moduleType: learningModule.moduleType,
        partKey: learningModule.partKey,
        orderIndex: learningModule.orderIndex,
        listenPercentMax: item?.listenPercentMax ?? 0,
        completed: Boolean(item?.completedAt),
        quizBestScore: item?.quizBestScore ?? null,
        quizBestTotal: item?.quizBestTotal ?? null,
        quizPassed: item?.quizPassed ?? false,
        lastActivityAt:
          lastActivityCandidates.length > 0
            ? new Date(
                Math.max(...lastActivityCandidates.map((value) => value.getTime()))
              )
            : null,
      });
    }
  }

  return rows.sort((a, b) => {
    const companyDelta = a.companyName.localeCompare(b.companyName, "fr");
    if (companyDelta !== 0) return companyDelta;
    const releaseDelta = b.releaseVersion - a.releaseVersion;
    if (releaseDelta !== 0) return releaseDelta;
    const learnerDelta = a.learnerName.localeCompare(b.learnerName, "fr");
    if (learnerDelta !== 0) return learnerDelta;
    return a.orderIndex - b.orderIndex;
  });
}

export function convertProgressRowsToCsv(rows: ProgressReportRow[]) {
  const header = [
    "company_name",
    "release_version",
    "learner_name",
    "learner_email",
    "part_key",
    "module_order",
    "module_title",
    "module_type",
    "listen_percent_max",
    "completed",
    "quiz_best_score",
    "quiz_best_total",
    "quiz_passed",
    "last_activity_at",
  ];

  const escape = (value: string | number | boolean | null) => {
    if (value === null) return "";
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, "\"\"")}"`;
    }
    return stringValue;
  };

  const body = rows.map((row) =>
    [
      row.companyName,
      row.releaseVersion,
      row.learnerName,
      row.learnerEmail,
      row.partKey,
      row.orderIndex,
      row.moduleTitle,
      row.moduleType,
      row.listenPercentMax,
      row.completed,
      row.quizBestScore,
      row.quizBestTotal,
      row.quizPassed,
      row.lastActivityAt ? row.lastActivityAt.toISOString() : null,
    ]
      .map(escape)
      .join(",")
  );

  return [header.join(","), ...body].join("\n");
}
