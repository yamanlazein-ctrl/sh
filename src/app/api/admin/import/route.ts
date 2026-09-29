import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const body = await request.json();
    const { items, autoDetectCategory } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "قائمة العناصر المراد استيرادها فارغة" },
        { status: 400 }
      );
    }

    const inserted = [];
    for (const rawItem of items) {
      const title = rawItem.title || rawItem.name || "مادة مؤرشفة بدون عنوان";
      let type = rawItem.type || "article";
      let category = rawItem.category || "تفسير";

      // Auto classify if requested
      if (autoDetectCategory) {
        const textToAnalyze = `${title} ${rawItem.content || ""} ${rawItem.summary || ""}`.toLowerCase();
        if (textToAnalyze.includes("فتوى") || textToAnalyze.includes("حكم") || textToAnalyze.includes("سؤال وجواب")) {
          type = "fatwa";
          category = "فقه وأصول";
        } else if (textToAnalyze.includes("حديث") || textToAnalyze.includes("قال رسول الله") || textToAnalyze.includes("رواه")) {
          type = "hadith";
          category = "حديث وسنة";
        } else if (textToAnalyze.includes("تفسير") || textToAnalyze.includes("آية") || textToAnalyze.includes("سورة")) {
          category = "تفسير";
        } else if (textToAnalyze.includes("قصيدة") || textToAnalyze.includes("شعر") || textToAnalyze.includes("أبيات")) {
          type = "poem";
        } else if (textToAnalyze.includes("ذكر") || textToAnalyze.includes("دعاء") || textToAnalyze.includes("تسبيح")) {
          type = "dhikr";
        } else if (rawItem.mediaUrl && (rawItem.mediaUrl.endsWith(".mp3") || rawItem.mediaUrl.includes("audio"))) {
          type = "audio";
        } else if (rawItem.mediaUrl && (rawItem.mediaUrl.includes("youtube") || rawItem.mediaUrl.includes("youtu.be"))) {
          type = "video";
        }
      }

      const baseSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `imported-${Date.now()}`;
      
      const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      const [res] = await db
        .insert(contentItems)
        .values({
          title,
          slug,
          type,
          category,
          summary: rawItem.summary || (rawItem.content ? rawItem.content.slice(0, 150) + "..." : ""),
          content: rawItem.content || "",
          author: rawItem.author || "الشيخ محمد علي الصابوني",
          source: rawItem.source || "الأرشيف الرقمي القديم",
          mediaUrl: rawItem.mediaUrl || null,
          coverImage: rawItem.coverImage || null,
          metadata: rawItem.metadata || {},
          tags: Array.isArray(rawItem.tags) ? rawItem.tags : ["أرشيف قديم", category, type],
          isFeatured: Boolean(rawItem.isFeatured),
          isPublished: true,
        })
        .returning();

      inserted.push(res);
    }

    return NextResponse.json({
      success: true,
      message: `تم استيراد ${inserted.length} مادة بنجاح وتصنيفها آلياً`,
      importedCount: inserted.length,
      items: inserted,
    });
  } catch (error) {
    console.error("Error bulk importing items:", error);
    return NextResponse.json(
      { success: false, error: "فشل الاستيراد التلقائي للمحتوى" },
      { status: 500 }
    );
  }
}
