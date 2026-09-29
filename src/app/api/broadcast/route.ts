import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { externalBroadcasts } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDatabaseSeeded();
    const broadcasts = await db
      .select()
      .from(externalBroadcasts)
      .orderBy(desc(externalBroadcasts.publishedAt))
      .limit(20);

    return NextResponse.json({ success: true, broadcasts });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch broadcasts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, contentPreview, channels, targetItemId } = body;

    if (!title || !channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json(
        { success: false, error: "العنوان وقنوات النشر مطلوبة" },
        { status: 400 }
      );
    }

    const [newBroadcast] = await db
      .insert(externalBroadcasts)
      .values({
        title,
        contentPreview: contentPreview || title,
        channels,
        targetItemId: targetItemId ? Number(targetItemId) : null,
        status: "published",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `تم النشر بنجاح على القنوات: ${channels.join(", ")}`,
      broadcast: newBroadcast,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return NextResponse.json(
      { success: false, error: "فشل نشر البث الخارجي" },
      { status: 500 }
    );
  }
}
