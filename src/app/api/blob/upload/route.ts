import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing file field in form data." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const blob = await put(`audio/${file.name}`, new Blob([arrayBuffer], { type: file.type || "audio/mpeg" }), {
    access: "public",
  });

  return NextResponse.json(blob);
}
