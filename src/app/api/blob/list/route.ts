import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") ?? "audio/";
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;

  const data = await list({
    prefix,
    cursor,
    limit: Number.isNaN(limit) ? 100 : limit,
  });

  return NextResponse.json(data);
}
