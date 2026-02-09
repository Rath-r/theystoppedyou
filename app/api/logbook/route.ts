import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const file = path.join(process.cwd(), "LOGBOOK.md");
    const content = await fs.readFile(file, "utf8");
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read logbook" },
      { status: 500 },
    );
  }
}
