import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { listElevenLabsVoices } from "@/lib/ai/elevenlabs-client";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      femaleVoiceId: true,
      femaleVoiceName: true,
      maleVoiceId: true,
      maleVoiceName: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Societe introuvable." }, { status: 404 });
  }

  try {
    const voices = await listElevenLabsVoices();
    return NextResponse.json({
      company,
      voices,
    });
  } catch (error) {
    return NextResponse.json(
      {
        company,
        voices: [],
        warning:
          error instanceof Error
            ? `Impossible de recuperer les voix ElevenLabs: ${error.message}`
            : "Impossible de recuperer les voix ElevenLabs.",
      },
      { status: 200 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const femaleVoiceId = typeof body.femaleVoiceId === "string" ? body.femaleVoiceId.trim() : "";
  const maleVoiceId = typeof body.maleVoiceId === "string" ? body.maleVoiceId.trim() : "";

  if (!femaleVoiceId || !maleVoiceId) {
    return NextResponse.json(
      { error: "femaleVoiceId et maleVoiceId sont obligatoires." },
      { status: 400 }
    );
  }

  if (femaleVoiceId === maleVoiceId) {
    return NextResponse.json(
      { error: "Les deux voix doivent etre distinctes." },
      { status: 400 }
    );
  }

  let voices: { voice_id: string; name: string }[];
  try {
    voices = await listElevenLabsVoices();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Impossible de recuperer les voix ElevenLabs: ${error.message}`
            : "Impossible de recuperer les voix ElevenLabs.",
      },
      { status: 502 }
    );
  }
  const femaleVoice = voices.find((voice) => voice.voice_id === femaleVoiceId);
  const maleVoice = voices.find((voice) => voice.voice_id === maleVoiceId);

  if (!femaleVoice || !maleVoice) {
    return NextResponse.json(
      { error: "Voix introuvable dans ElevenLabs. Rafraichissez la liste." },
      { status: 400 }
    );
  }

  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      femaleVoiceId,
      femaleVoiceName: femaleVoice.name,
      maleVoiceId,
      maleVoiceName: maleVoice.name,
    },
    select: {
      id: true,
      femaleVoiceId: true,
      femaleVoiceName: true,
      maleVoiceId: true,
      maleVoiceName: true,
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId,
      actionType: "COMPANY_VOICES_UPDATED",
      metadata: {
        femaleVoiceId,
        femaleVoiceName: femaleVoice.name,
        maleVoiceId,
        maleVoiceName: maleVoice.name,
      },
    },
  });

  return NextResponse.json({ ok: true, company });
}
