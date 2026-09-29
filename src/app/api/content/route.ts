import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const conditions = [];

    if (type && type !== "all") {
      conditions.push(eq(contentItems.type, type));
    }

    if (category && category !== "all") {
      conditions.push(eq(contentItems.category, category));
    }

    if (featured === "true") {
      conditions.push(eq(contentItems.isFeatured, true));
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          like(contentItems.title, q),
          like(contentItems.summary, q),
          like(contentItems.content, q),
          like(contentItems.category, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(contentItems)
      .where(whereClause)
      .orderBy(desc(contentItems.createdAt))
      .limit(limit)
      .offset(offset);

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(whereClause);

    return NextResponse.json({
      success: true,
      items,
      total: Number(totalRes[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching content items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, category, summary, content, source, mediaUrl, coverImage, metadata, tags, isFeatured } = body;

    if (!title || !type || !category) {
      return NextResponse.json(
        { success: false, error: "Title, type, and category are required" },
        { status: 400 }
      );
    }

    const baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
    
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [newItem] = await db
      .insert(contentItems)
      .values({
        title,
        slug: uniqueSlug,
        type,
        category,
        summary: summary || "",
        content: content || "",
        author: "الشيخ محمد علي الصابوني",
        source: source || "",
        mediaUrl: mediaUrl || null,
        coverImage: coverImage || null,
        metadata: metadata || {},
        tags: Array.isArray(tags) ? tags : [],
        isFeatured: Boolean(isFeatured),
        isPublished: true,
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating content item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create content item" },
      { status: 500 }
    );
  }
}
