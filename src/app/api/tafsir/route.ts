import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tafsirVerses } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const searchParams = request.nextUrl.searchParams;
    const surah = searchParams.get("surah");
    const ayah = searchParams.get("ayah");

    const conditions = [];

    if (surah) {
      conditions.push(eq(tafsirVerses.surahNumber, parseInt(surah, 10)));
    }

    if (ayah) {
      conditions.push(eq(tafsirVerses.ayahNumber, parseInt(ayah, 10)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const verses = await db
      .select()
      .from(tafsirVerses)
      .where(whereClause)
      .orderBy(tafsirVerses.surahNumber, tafsirVerses.ayahNumber);

    return NextResponse.json({
      success: true,
      verses,
      total: verses.length,
    });
  } catch (error) {
    console.error("Error fetching tafsir verses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tafsir" },
      { status: 500 }
    );
  }
}
