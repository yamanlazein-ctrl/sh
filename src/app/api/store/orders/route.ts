import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeOrders } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      const order = await db
        .select()
        .from(storeOrders)
        .where(eq(storeOrders.orderNumber, orderNumber.trim()))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 });
      }

      return NextResponse.json({ success: true, order: order[0] });
    }

    // List all orders (for admin)
    const orders = await db.select().from(storeOrders).orderBy(desc(storeOrders.createdAt)).limit(50);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      country,
      city,
      address,
      paymentMethod,
      currency,
      totalAmount,
      items,
      notes,
    } = body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة كافة الحقول المطلوبة وقائمة الكتب" },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

    const [newOrder] = await db
      .insert(storeOrders)
      .values({
        orderNumber,
        customerName,
        customerEmail: customerEmail || "guest@example.com",
        customerPhone,
        country: country || "سوريا",
        city: city || "دمشق",
        address: address || "العنوان بالتفصيل",
        paymentMethod: paymentMethod || "cham_cash",
        currency: currency || "SYP",
        totalAmount: String(totalAmount || 0),
        status: "confirmed",
        items,
        notes: notes || "",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلبكم بنجاح",
      order: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تسجيل الطلب" },
      { status: 500 }
    );
  }
}
