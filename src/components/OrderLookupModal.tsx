"use client";

import React, { useState } from "react";
import { Search, X, Package, CheckCircle2, Clock, Truck, AlertCircle } from "lucide-react";

interface OrderDetail {
  orderNumber: string;
  customerName: string;
  country: string;
  city: string;
  address: string;
  status: string;
  totalAmount: string;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    format: string;
  }>;
}

export default function OrderLookupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/store/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError("لم يتم العثور على طلب بهذا الرقم. تأكد من صحة الرمز (مثال: ORD-2025-1001)");
      }
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> تم التسليم بنجاح
          </span>
        );
      case "shipped":
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> جاري التوصيل مع المندوب
          </span>
        );
      case "processing":
      case "confirmed":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> قيد التجهيز والتغليف
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            قيد المراجعة
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E0D7C9] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#EAE3D7] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Package className="w-5 h-5 text-[#8E2336]" />
            <span>تتبع حالة شحنة الكتب</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="أدخل رقم الطلب مثل: ORD-2025-1001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E0D7C9] text-xs font-mono focus:border-[#8E2336] outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-[#8E2336] hover:bg-[#a1293f] text-white rounded-xl text-xs font-bold shrink-0 transition"
            >
              {loading ? "بحث..." : "تتبع"}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="p-4 bg-white border border-[#E0D7C9] rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {order.orderNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{order.customerName}</h4>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">وجهة التوصيل:</span>
                  <span className="font-semibold">{order.country} - {order.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">المبلغ الإجمالي:</span>
                  <span className="font-bold text-[#8E2336]">{order.totalAmount} {order.currency}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">الكتب المطلوبة:</span>
                <div className="space-y-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs p-2 bg-[#FAF8F5] rounded-lg">
                      <span className="font-medium">{it.title} × {it.quantity}</span>
                      <span className="text-slate-500 font-mono">{it.price} {order.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
