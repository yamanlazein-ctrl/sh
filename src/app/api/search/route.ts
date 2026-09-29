import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems, tafsirVerses } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { or, like, desc, sql } from "drizzle-orm";

// Intelligent query expansion mapping
const SYNONYMS_MAP: Record<string, string[]> = {
  "صلاة": ["الصلاة", "تأخير الصلاة", "وقت الصلاة", "جمع الصلاة", "الفاتحة"],
  "تأخير": ["تأخير الصلاة", "خروج الوقت", "قضاء الصلاة"],
  "ميراث": ["المواريث", "الفرائض", "التركات", "البنات", "الأعمام", "الإرث"],
  "تركة": ["ميراث", "فرائض", "ورثة", "قسمة"],
  "تفسير": ["صفوة التفاسير", "روائع البيان", "معاني", "القرآن", "سورة"],
  "زكاة": ["صدقة", "نصاب", "ذهب", "أموال"],
  "حلب": ["الشهباء", "الخسروية", "الشام", "شيوخ"],
  "سيرة": ["حياة الشيخ", "ترجمة", "شيوخه", "مكة المكرمة", "الأزهر"],
  "صوت": ["صوتيات", "تسجيل", "محاضرة", "استماع"],
  "فيديو": ["مرئي", "برنامج", "تلفزيون", "اقرأ", "المجد"],
  "كتاب": ["كتب", "مؤلفات", "تحميل", "pdf", "شراء"],
};

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const typeFilter = searchParams.get("type");

    if (!query) {
      // Return top featured and recent items
      const recentItems = await db
        .select()
        .from(contentItems)
        .where(sql`${contentItems.isPublished} = true`)
        .orderBy(desc(contentItems.viewsCount))
        .limit(10);

      return NextResponse.json({
        success: true,
        query: "",
        results: recentItems,
        tafsirMatches: [],
        counts: { total: recentItems.length },
      });
    }

    const searchTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const expandedTokens = new Set<string>(searchTokens);

    searchTokens.forEach((token) => {
      for (const [key, synonyms] of Object.entries(SYNONYMS_MAP)) {
        if (token.includes(key) || key.includes(token)) {
          synonyms.forEach((s) => expandedTokens.add(s));
        }
      }
    });

    const tokenList = Array.from(expandedTokens);
    const likeConditions = tokenList.map((t) => `%${t}%`);

    // Search in content items
    const contentWhere = or(
      ...likeConditions.map((pattern) =>
        or(
          like(contentItems.title, pattern),
          like(contentItems.summary, pattern),
          like(contentItems.content, pattern),
          like(contentItems.category, pattern)
        )
      )
    );

    const matchedContent = await db
      .select()
      .from(contentItems)
      .where(contentWhere)
      .limit(30);

    // Filter by type if provided
    const filteredContent = typeFilter && typeFilter !== "all"
      ? matchedContent.filter((i) => i.type === typeFilter)
      : matchedContent;

    // Search in Tafsir Verses
    const tafsirWhere = or(
      ...likeConditions.map((pattern) =>
        or(
          like(tafsirVerses.ayahText, pattern),
          like(tafsirVerses.tafsirSummary, pattern),
          like(tafsirVerses.tafsirFull, pattern),
          like(tafsirVerses.surahName, pattern)
        )
      )
    );

    const matchedTafsir = await db
      .select()
      .from(tafsirVerses)
      .where(tafsirWhere)
      .limit(10);

    // Group counts by type
    const typeCounts: Record<string, number> = {};
    matchedContent.forEach((item) => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      query,
      results: filteredContent,
      tafsirMatches: matchedTafsir,
      counts: {
        total: filteredContent.length + matchedTafsir.length,
        byType: typeCounts,
        tafsirCount: matchedTafsir.length,
      },
      expandedKeywords: tokenList,
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { success: false, error: "Search execution failed" },
      { status: 500 }
    );
  }
}
