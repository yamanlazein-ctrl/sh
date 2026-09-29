import { db } from "./index";
import { contentItems, tafsirVerses, storeOrders, visitorQuestions, externalBroadcasts } from "./schema";
import { SEED_CONTENT_ITEMS, SEED_TAFSIR_VERSES, SEED_STORE_ORDERS, SEED_VISITOR_QUESTIONS, SEED_BROADCASTS } from "./seed-data";
import { sql } from "drizzle-orm";

export async function ensureDatabaseSeeded() {
  try {
    // Check if content_items table has data
    const existingContent = await db.select({ count: sql<number>`count(*)` }).from(contentItems);
    const count = Number(existingContent[0]?.count || 0);

    if (count === 0) {
      console.log("Seeding initial data for Sheikh Al-Sabuni platform...");

      // Seed Content Items
      for (const item of SEED_CONTENT_ITEMS) {
        await db.insert(contentItems).values(item).onConflictDoNothing();
      }

      // Seed Tafsir Verses
      for (const verse of SEED_TAFSIR_VERSES) {
        await db.insert(tafsirVerses).values(verse).onConflictDoNothing();
      }

      // Seed Store Orders
      for (const order of SEED_STORE_ORDERS) {
        await db.insert(storeOrders).values(order).onConflictDoNothing();
      }

      // Seed Visitor Questions
      for (const q of SEED_VISITOR_QUESTIONS) {
        await db.insert(visitorQuestions).values(q).onConflictDoNothing();
      }

      // Seed Broadcasts
      for (const b of SEED_BROADCASTS) {
        await db.insert(externalBroadcasts).values(b).onConflictDoNothing();
      }

      console.log("Seeding completed successfully!");
    }
  } catch (error) {
    console.warn("Database seeding check or execution encountered an error:", error);
  }
}
