import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // 'fatwa' | 'hadith' | 'book' | 'fiqh_research' | 'article' | 'lecture' | 'poem' | 'dhikr' | 'document_photo' | 'audio' | 'video' | 'quote'
  category: text("category").notNull(), // 'تفسير' | 'فقه وأصول' | 'حديث وسنة' | 'عقيدة' | 'سلوك ورقائق' | 'سيرة وتاريخ' | 'دراسات معاصرة'
  summary: text("summary"),
  content: text("content"),
  author: text("author").default("الشيخ محمد علي الصابوني"),
  source: text("source"),
  mediaUrl: text("media_url"),
  coverImage: text("cover_image"),
  metadata: jsonb("metadata").$type<{
    duration?: string;
    youtubeId?: string;
    pagesCount?: number;
    volumesCount?: number;
    edition?: string;
    publisher?: string;
    price?: number;
    priceSyp?: number;
    narrator?: string;
    hadithGrade?: string;
    poemMeter?: string;
    versesCount?: number;
    repeatCount?: number;
    dhikrVirtue?: string;
    year?: string;
    location?: string;
    isbn?: string;
    hijriDate?: string;
  }>(),
  tags: text("tags").array(),
  viewsCount: integer("views_count").default(0),
  downloadsCount: integer("downloads_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tafsirVerses = pgTable("tafsir_verses", {
  id: serial("id").primaryKey(),
  surahNumber: integer("surah_number").notNull(),
  surahName: text("surah_name").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  ayahText: text("ayah_text").notNull(),
  tafsirSummary: text("tafsir_summary").notNull(),
  tafsirFull: text("tafsir_full").notNull(),
  linguisticNuances: text("linguistic_nuances"),
  legalRulings: text("legal_rulings"),
  revelationReason: text("revelation_reason"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storeOrders = pgTable("store_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cham_cash' | 'syriatel_cash' | 'al_haram' | 'cod' | 'card'
  currency: text("currency").default("USD").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: jsonb("items").$type<Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    coverImage?: string;
    format: "physical" | "digital";
  }>>().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visitorQuestions = pgTable("visitor_questions", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderCountry: text("sender_country"),
  topic: text("topic").notNull(),
  questionText: text("question_text").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'answered' | 'rejected'
  answerText: text("answer_text"),
  answeredBy: text("answered_by"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const externalBroadcasts = pgTable("external_broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contentPreview: text("content_preview").notNull(),
  channels: jsonb("channels").$type<string[]>().notNull(), // ['facebook', 'telegram', 'whatsapp', 'youtube']
  status: text("status").default("published").notNull(),
  targetItemId: integer("target_item_id"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;

export type TafsirVerse = typeof tafsirVerses.$inferSelect;
export type NewTafsirVerse = typeof tafsirVerses.$inferInsert;

export type StoreOrder = typeof storeOrders.$inferSelect;
export type NewStoreOrder = typeof storeOrders.$inferInsert;

export type VisitorQuestion = typeof visitorQuestions.$inferSelect;
export type NewVisitorQuestion = typeof visitorQuestions.$inferInsert;

export type ExternalBroadcast = typeof externalBroadcasts.$inferSelect;
export type NewExternalBroadcast = typeof externalBroadcasts.$inferInsert;
