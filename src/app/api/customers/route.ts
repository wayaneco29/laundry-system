import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const body = await req.json();
  return NextResponse.json({ success: true });
}
