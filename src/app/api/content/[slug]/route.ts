import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const items = await db.select().from(contentItems).where(eq(contentItems.slug, slug)).limit(1);

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 });
    }

    // Increment views count asynchronously
    await db
      .update(contentItems)
      .set({ viewsCount: sql`${contentItems.viewsCount} + 1` })
      .where(eq(contentItems.slug, slug));

    return NextResponse.json({ success: true, item: items[0] });
  } catch (error) {
    console.error("Error fetching content item:", error);
    return NextResponse.json({ success: false, error: "Failed to load content" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(contentItems)
      .set({
        title: body.title,
        category: body.category,
        summary: body.summary,
        content: body.content,
        source: body.source,
        mediaUrl: body.mediaUrl,
        coverImage: body.coverImage,
        metadata: body.metadata,
        tags: body.tags,
        isFeatured: body.isFeatured,
        isPublished: body.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.slug, slug))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Error updating content item:", error);
    return NextResponse.json({ success: false, error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await db.delete(contentItems).where(eq(contentItems.slug, slug));
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting content item:", error);
    return NextResponse.json({ success: false, error: "Failed to delete content" }, { status: 500 });
  }
}
