import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visitorQuestions } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get("all") === "true";

    const list = all
      ? await db.select().from(visitorQuestions).orderBy(desc(visitorQuestions.createdAt)).limit(50)
      : await db.select().from(visitorQuestions).where(eq(visitorQuestions.isPublic, true)).orderBy(desc(visitorQuestions.createdAt)).limit(50);

    return NextResponse.json({ success: true, questions: list });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderName, senderEmail, senderCountry, topic, questionText } = body;

    if (!senderName || !senderEmail || !topic || !questionText) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة جميع الحقول الإلزامية" },
        { status: 400 }
      );
    }

    const [newQuestion] = await db
      .insert(visitorQuestions)
      .values({
        senderName,
        senderEmail,
        senderCountry: senderCountry || "غير محدد",
        topic,
        questionText,
        status: "pending",
        isPublic: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "تم إرسال سؤالكم بنجاح وسيتم الرد عليه قريباً بإذن الله",
      question: newQuestion,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "فشل إرسال السؤال" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, answerText, answeredBy, isPublic, status } = body;

    if (!id || !answerText) {
      return NextResponse.json({ success: false, error: "ID and answer are required" }, { status: 400 });
    }

    const [updated] = await db
      .update(visitorQuestions)
      .set({
        answerText,
        answeredBy: answeredBy || "لجنة الفتوى بدار الصابوني",
        status: status || "answered",
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      })
      .where(eq(visitorQuestions.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ success: false, error: "Failed to update question" }, { status: 500 });
  }
}
