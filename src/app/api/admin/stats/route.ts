import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems, storeOrders, visitorQuestions, externalBroadcasts } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDatabaseSeeded();

    const allContent = await db.select().from(contentItems);
    const orders = await db.select().from(storeOrders);
    const questions = await db.select().from(visitorQuestions);
    const broadcasts = await db.select().from(externalBroadcasts);

    const typeBreakdown: Record<string, number> = {};
    let totalViews = 0;
    let totalDownloads = 0;

    allContent.forEach((item) => {
      typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
      totalViews += item.viewsCount || 0;
      totalDownloads += item.downloadsCount || 0;
    });

    const pendingQuestions = questions.filter((q) => q.status === "pending").length;

    let revenueSyp = 0;
    let revenueUsd = 0;
    orders.forEach((o) => {
      const amt = parseFloat(o.totalAmount || "0");
      if (o.currency === "SYP") {
        revenueSyp += amt;
      } else {
        revenueUsd += amt;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalContent: allContent.length,
        typeBreakdown,
        totalViews,
        totalDownloads,
        ordersCount: orders.length,
        revenueSyp,
        revenueUsd,
        questionsCount: questions.length,
        pendingQuestions,
        broadcastsCount: broadcasts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
