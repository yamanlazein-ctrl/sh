"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotalPriceSyp,
    cartTotalPriceUsd,
    currency,
    setCurrency,
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [loading, setLoading] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [country, setCountry] = useState("سوريا");
  const [city, setCity] = useState("دمشق");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cham_cash");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      setFormError("يرجى ملء الاسم الكامل، ورقم الهاتف، والعنوان بالتفصيل");
      return;
    }
    setFormError("");
    setLoading(true);

    try {
      const orderData = {
        customerName,
        customerEmail: customerEmail || "guest@sabuni.org",
        customerPhone,
        country,
        city,
        address,
        paymentMethod,
        currency,
        totalAmount: currency === "SYP" ? cartTotalPriceSyp : cartTotalPriceUsd,
        items: cart,
        notes,
      };

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrderNumber(data.order.orderNumber);
        setCheckoutStep("success");
        clearCart();
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {
          console.warn("Confetti ignored:", err);
        }
      } else {
        setFormError(data.error || "فشل إرسال الطلب، يرجى المحاولة ثانية");
      }
    } catch (err) {
      console.error("Order error:", err);
      setFormError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(createdOrderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (usd: number, syp?: number) => {
    if (currency === "SYP") {
      const price = syp || usd * 13000;
      return `${price.toLocaleString("ar-SY")} ل.س`;
    }
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-r border-[#E0D7C9]">
          {/* Header */}
          <div className="p-4 bg-white border-b border-[#EAE3D7] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <ShoppingBag className="w-5 h-5 text-[#8E2336]" />
              <h3 className="font-bold text-base">
                {checkoutStep === "cart"
                  ? `سلة المشتريات (${cart.length})`
                  : checkoutStep === "checkout"
                  ? "إتمام الطلب والشحن"
                  : "تم تسجيل الطلب"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Currency Selector */}
              {checkoutStep !== "success" && (
                <div className="flex items-center text-xs bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setCurrency("SYP")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                      currency === "SYP" ? "bg-[#8E2336] text-white" : "text-slate-600"
                    }`}
                  >
                    ل.س
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                      currency === "USD" ? "bg-[#8E2336] text-white" : "text-slate-600"
                    }`}
                  >
                    USD
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 flex-1 overflow-y-auto">
            {checkoutStep === "cart" && (
              <>
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#8E2336]/10 text-[#8E2336] flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-700">سلتك فارغة حالياً</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      تصفح متجر مؤلفات وتفاسير الشيخ الصابوني واطلب النسخ الورقية أو الرقمية مباشرة.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.format}`}
                        className="p-3.5 bg-white border border-[#EAE3D7] rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.coverImage ? (
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-amiri text-xs font-bold text-slate-400">كتاب</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {item.title}
                            </h5>
                            <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium mt-0.5">
                              {item.format === "physical" ? "نسخة مطبوعة مجلدة" : "نسخة رقمية PDF"}
                            </span>
                            <p className="text-xs font-bold text-[#8E2336] mt-1">
                              {formatPrice(item.price, item.priceSyp)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls & Delete */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-700">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {checkoutStep === "checkout" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل للمستلم *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الحلبي"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف / واتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+963 944 123 456"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الدولة</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                    >
                      <option value="سوريا">سوريا</option>
                      <option value="السعودية">السعودية</option>
                      <option value="تركيا">تركيا</option>
                      <option value="الأردن">الأردن</option>
                      <option value="مصر">مصر</option>
                      <option value="الإمارات">الإمارات</option>
                      <option value="أخرى">دولة أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / المحافظة</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                    >
                      <option value="دمشق">دمشق</option>
                      <option value="حلب">حلب</option>
                      <option value="حمص">حمص</option>
                      <option value="اللاذقية">اللاذقية</option>
                      <option value="حماة">حماة</option>
                      <option value="طرطوس">طرطوس</option>
                      <option value="ريف دمشق">ريف دمشق</option>
                      <option value="أخرى">مدينة أخرى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان التفصيلي للتسليم *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="الحي، الشارع، المعلم القريب، البناء"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                  />
                </div>

                {/* Syrian & Regional Payment Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    طريقة الدفع المفضلة
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        paymentMethod === "cham_cash"
                          ? "bg-amber-50/80 border-[#8E2336] text-[#8E2336] font-bold"
                          : "bg-white border-[#E0D7C9] text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cham_cash"
                        checked={paymentMethod === "cham_cash"}
                        onChange={() => setPaymentMethod("cham_cash")}
                        className="hidden"
                      />
                      <span>💳 شام كاش (Cham Cash)</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        paymentMethod === "syriatel_cash"
                          ? "bg-amber-50/80 border-[#8E2336] text-[#8E2336] font-bold"
                          : "bg-white border-[#E0D7C9] text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="syriatel_cash"
                        checked={paymentMethod === "syriatel_cash"}
                        onChange={() => setPaymentMethod("syriatel_cash")}
                        className="hidden"
                      />
                      <span>📱 سيريتل كاش</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        paymentMethod === "al_haram"
                          ? "bg-amber-50/80 border-[#8E2336] text-[#8E2336] font-bold"
                          : "bg-white border-[#E0D7C9] text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="al_haram"
                        checked={paymentMethod === "al_haram"}
                        onChange={() => setPaymentMethod("al_haram")}
                        className="hidden"
                      />
                      <span>🏢 حوالة الهرم / الفؤاد</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        paymentMethod === "cod"
                          ? "bg-amber-50/80 border-[#8E2336] text-[#8E2336] font-bold"
                          : "bg-white border-[#E0D7C9] text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="hidden"
                      />
                      <span>💵 الدفع عند الاستلام</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملاحظات أو توجيهات للمندوب
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E0D7C9] focus:border-[#8E2336] outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#8E2336] hover:bg-[#a1293f] text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "جاري تسجيل الطلب..." : "تأكيد الطلب والشحن الآن"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("cart")}
                    className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    العودة لمراجعة السلة
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === "success" && (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    بارك الله فيكم! تم استلام طلبكم بنجاح
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    سيتم تجهيز الطرد وشحنه إلى عنوانكم والتواصل معكم عبر الواتساب لتأكيد موعد التسليم.
                  </p>
                </div>

                {/* Tracking Box */}
                <div className="p-4 bg-white border border-[#E0D7C9] rounded-2xl space-y-2">
                  <span className="text-xs text-slate-500 font-medium">رقم التتبع الخاص بالطلب</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#8E2336] tracking-wider">
                      {createdOrderNumber}
                    </span>
                    <button
                      onClick={copyOrderNumber}
                      className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg"
                      title="نسخ رقم الطلب"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    احفظ هذا الرقم لمتابعة حالة شحنتك من صفحة متجر الكتب.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep("cart");
                  }}
                  className="w-full py-2.5 bg-[#8E2336] text-white rounded-xl text-xs font-bold hover:bg-[#a1293f] transition"
                >
                  إغلاق ومتابعة التصفح
                </button>
              </div>
            )}
          </div>

          {/* Footer Subtotal (for Cart Step) */}
          {checkoutStep === "cart" && cart.length > 0 && (
            <div className="p-4 bg-white border-t border-[#EAE3D7] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>المجموع الكلي:</span>
                <span className="text-base font-bold text-[#8E2336]">
                  {currency === "SYP"
                    ? `${cartTotalPriceSyp.toLocaleString("ar-SY")} ل.س`
                    : `$${cartTotalPriceUsd.toFixed(2)}`}
                </span>
              </div>
              <button
                onClick={() => setCheckoutStep("checkout")}
                className="w-full py-3 bg-[#8E2336] hover:bg-[#a1293f] text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>متابعة الشحن وطريقة الدفع</span>
                <Truck className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
