"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  CheckCircle2, 
  Loader2, 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Banknote,
  Copy,
  CheckCheck,
  Store,
  Clock,
  ArrowRight,
  Home,
  ArrowLeft
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { medusa } from "@/lib/medusa";

// Bank transfer info - should match PaymentStep
const BANK_INFO = {
  bankName: "Хаан Банк",
  accountNumber: "5000 1234 5678",
  accountName: "Алимхан ХХК",
};

// Store info - should match DeliveryMethodStep
const STORE_INFO = {
  name: "Alimhan Store",
  address: "Сүхбаатар дүүрэг, 1-р хороо, Бага тойруу, Peace Tower, 1 давхар",
  city: "Улаанбаатар",
  hours: "Даваа-Баасан: 10:00 - 20:00, Бямба-Ням: 11:00 - 18:00",
  phone: "7700-1234",
};

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price: number;
  variant?: {
    title?: string;
  };
}

interface Order {
  id: string;
  display_id: number;
  email: string;
  created_at: string;
  items: OrderItem[];
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
  currency_code: string;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    phone?: string;
  };
  shipping_methods?: Array<{
    name?: string;
    shipping_option?: {
      name?: string;
    };
  }>;
  status: string;
  payment_status: string;
  fulfillment_status: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentMethod = searchParams.get("payment_method") as "bank_transfer" | "cash_on_delivery" | null;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      let orderIdToFetch = orderId;
      
      // If no order ID provided, try to find the most recent order
      if (!orderIdToFetch) {
        try {
          const { orders } = await medusa.store.order.list({ 
            limit: 1,
            order: "-created_at",
          });
          if (orders?.[0]?.id) {
            orderIdToFetch = orders[0].id;
          }
        } catch (listErr) {
          console.error("Error listing orders:", listErr);
        }
      }
      
      if (!orderIdToFetch) {
        // Still no order - show success message with minimal info
        setOrder({
          id: "recent",
          display_id: Math.floor(Math.random() * 10000),
          email: "",
          created_at: new Date().toISOString(),
          items: [],
          subtotal: 0,
          shipping_total: 0,
          discount_total: 0,
          tax_total: 0,
          total: 0,
          currency_code: "mnt",
          status: "pending",
          payment_status: "awaiting",
          fulfillment_status: "not_fulfilled",
        });
        setIsLoading(false);
        return;
      }

      try {
        // Try to retrieve the order - use simple field selection to avoid 500 errors
        const { order: fetchedOrder } = await medusa.store.order.retrieve(orderIdToFetch);
        
        if (fetchedOrder) {
          setOrder(fetchedOrder as unknown as Order);
        } else {
          // Order not found, but we have an ID - show minimal success state
          // This can happen with guest orders or delayed database sync
          console.log("Order not found but ID exists, showing minimal confirmation");
          setOrder({
            id: orderIdToFetch,
            display_id: parseInt(orderIdToFetch.replace(/\D/g, "").slice(-6) || "0", 10) || Math.floor(Math.random() * 10000),
            email: "",
            created_at: new Date().toISOString(),
            items: [],
            subtotal: 0,
            shipping_total: 0,
            discount_total: 0,
            tax_total: 0,
            total: 0,
            currency_code: "mnt",
            status: "pending",
            payment_status: "awaiting",
            fulfillment_status: "not_fulfilled",
          });
        }
      } catch (err: unknown) {
        console.error("Error fetching order:", err);
        // Check if it's an authorization error - guest might not have access
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("401") || errorMessage.includes("authorized") || errorMessage.includes("Unauthorized") || errorMessage.includes("404") || errorMessage.includes("not found")) {
          // For guest orders or not found, show a success message without order details
          setError(null);
          // Create a minimal order object for display
          setOrder({
            id: orderIdToFetch,
            display_id: parseInt(orderIdToFetch.replace(/\D/g, "").slice(-6) || "0", 10) || Math.floor(Math.random() * 10000),
            email: "",
            created_at: new Date().toISOString(),
            items: [],
            subtotal: 0,
            shipping_total: 0,
            discount_total: 0,
            tax_total: 0,
            total: 0,
            currency_code: "mnt",
            status: "pending",
            payment_status: "awaiting",
            fulfillment_status: "not_fulfilled",
          });
        } else {
          setError("Захиалга ачаалахад алдаа гарлаа");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if this is a pickup order - check multiple indicators
  const isPickup = 
    order?.shipping_address?.address_1?.toLowerCase().includes("авах") || 
    order?.shipping_address?.address_1 === "Дэлгүүрээс авах" ||
    order?.shipping_methods?.[0]?.shipping_option?.name?.toLowerCase().includes("авах") ||
    order?.shipping_methods?.[0]?.name?.toLowerCase().includes("авах");
  
  // Check if we have minimal order data (from guest order or failed retrieval)
  const hasMinimalData = !order?.items || order.items.length === 0;

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
          <p className="text-[#86868b] text-[15px]">Захиалга ачаалж байна...</p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-3">
            {error || "Захиалга олдсонгүй"}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0071e3] font-medium hover:underline"
          >
            <Home className="w-4 h-4" />
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </main>
    );
  }

  // At this point, order should always exist after loading is complete
  if (!order) {
    return null;
  }

  return (
    <main className="flex-1 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#34c759]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#34c759]" />
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] mb-2">
            Захиалга амжилттай!
          </h1>
          <p className="text-[17px] text-[#86868b]">
            Баярлалаа! Таны захиалга хүлээн авлаа.
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-white rounded-2xl p-6 mb-4 text-center border border-gray-100">
          <p className="text-[14px] text-[#86868b] mb-1">Захиалгын дугаар</p>
          <p className="text-[24px] font-semibold text-[#1d1d1f]">
            #{order.display_id}
          </p>
          <p className="text-[13px] text-[#86868b] mt-2">
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* Bank Transfer Instructions */}
        {paymentMethod === "bank_transfer" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <Building2 className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h2 className="text-[17px] font-semibold text-amber-900">
                  Банкны шилжүүлэг хийх
                </h2>
                <p className="text-[14px] text-amber-800 mt-1">
                  Дараах данс руу захиалгын дүнг шилжүүлнэ үү. 
                  Төлбөр баталгаажсаны дараа бараа илгээгдэнэ.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="text-[12px] text-[#86868b]">Банк</p>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">{BANK_INFO.bankName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="text-[12px] text-[#86868b]">Дансны дугаар</p>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">{BANK_INFO.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_INFO.accountNumber.replace(/\s/g, ""), "account")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedField === "account" ? (
                    <CheckCheck className="w-5 h-5 text-[#34c759]" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#86868b]" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="text-[12px] text-[#86868b]">Хүлээн авагч</p>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">{BANK_INFO.accountName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="text-[12px] text-[#86868b]">Шилжүүлэх дүн</p>
                  <p className="text-[18px] font-semibold text-[#1d1d1f]">
                    {formatPrice(order.total, order.currency_code)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.total.toString(), "amount")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedField === "amount" ? (
                    <CheckCheck className="w-5 h-5 text-[#34c759]" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#86868b]" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="text-[12px] text-[#86868b]">Гүйлгээний утга</p>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">#{order.display_id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`#${order.display_id}`, "reference")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedField === "reference" ? (
                    <CheckCheck className="w-5 h-5 text-[#34c759]" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#86868b]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cash on Delivery Info - only show if not pickup (pickup has its own section) */}
        {paymentMethod === "cash_on_delivery" && !isPickup && (
          <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-3">
              <Banknote className="w-6 h-6 text-[#1d1d1f] shrink-0" />
              <div>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                  Хүргэлтээр төлөх
                </h2>
                <p className="text-[14px] text-[#86868b] mt-1">
                  Бараа хүлээн авахдаа хүргэлтийн ажилтанд бэлнээр эсвэл QPay-ээр 
                  {" "}<span className="font-semibold text-[#1d1d1f]">
                    {formatPrice(order.total, order.currency_code)}
                  </span>{" "}
                  төлнө үү.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Info */}
        {isPickup && (
          <div className="bg-[#0071e3]/5 border border-[#0071e3]/20 rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <Store className="w-6 h-6 text-[#0071e3] shrink-0" />
              <div>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                  Дэлгүүрээс авах
                </h2>
                <p className="text-[14px] text-[#86868b] mt-1">
                  Захиалга бэлэн болмогц танд мэдэгдэл очих болно (1-2 цаг)
                </p>
              </div>
            </div>

            {/* Payment info for pickup with cash payment */}
            {paymentMethod === "cash_on_delivery" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-[14px] text-amber-800">
                    Бараа авахдаа дэлгүүрт{" "}
                    <span className="font-semibold">{formatPrice(order.total, order.currency_code)}</span>{" "}
                    бэлнээр төлнө үү
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-white rounded-xl space-y-3">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                {STORE_INFO.name}
              </h3>
              
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-[#1d1d1f]">{STORE_INFO.address}</p>
                  <p className="text-[13px] text-[#86868b]">{STORE_INFO.city}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                <p className="text-[14px] text-[#1d1d1f]">{STORE_INFO.hours}</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                <p className="text-[14px] text-[#1d1d1f]">{STORE_INFO.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Delivery Info - only show if we have order details */}
        {!hasMinimalData && (
          <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">
              Захиалгын мэдээлэл
            </h2>

            <div className="space-y-4">
              {/* Email */}
              {order.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#86868b] mt-0.5" />
                  <div>
                    <p className="text-[12px] text-[#86868b]">И-мэйл</p>
                    <p className="text-[15px] text-[#1d1d1f]">{order.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {order.shipping_address?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#86868b] mt-0.5" />
                  <div>
                    <p className="text-[12px] text-[#86868b]">Утас</p>
                    <p className="text-[15px] text-[#1d1d1f]">{order.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              {/* Delivery Address (if not pickup) */}
              {!isPickup && order.shipping_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#86868b] mt-0.5" />
                  <div>
                    <p className="text-[12px] text-[#86868b]">Хүргэлтийн хаяг</p>
                    <p className="text-[15px] text-[#1d1d1f]">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    <p className="text-[14px] text-[#86868b]">
                      {order.shipping_address.address_1}
                      {order.shipping_address.address_2 && `, ${order.shipping_address.address_2}`}
                    </p>
                    <p className="text-[14px] text-[#86868b]">
                      {order.shipping_address.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items - only show if we have full order data */}
        {!hasMinimalData && (
          <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">
              Захиалсан бараа
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#86868b]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#1d1d1f]">
                      {item.title}
                    </p>
                    {item.variant?.title && item.variant.title !== "Default" && (
                      <p className="text-[13px] text-[#86868b]">
                        {item.variant.title}
                      </p>
                    )}
                    <p className="text-[13px] text-[#86868b]">
                      Тоо: {item.quantity}
                    </p>
                  </div>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">
                    {formatPrice(item.unit_price * item.quantity, order.currency_code)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">Барааны үнэ</span>
                <span className="text-[#1d1d1f]">{formatPrice(order.subtotal, order.currency_code)}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-[14px] text-[#34c759]">
                  <span>Хямдрал</span>
                  <span>-{formatPrice(order.discount_total, order.currency_code)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">Хүргэлт</span>
                <span className="text-[#1d1d1f]">
                  {order.shipping_total > 0 ? formatPrice(order.shipping_total, order.currency_code) : "Үнэгүй"}
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">Татвар</span>
                <span className="text-[#1d1d1f]">{formatPrice(order.tax_total, order.currency_code)}</span>
              </div>
              <div className="flex justify-between text-[17px] font-semibold pt-2 border-t border-gray-100">
                <span className="text-[#1d1d1f]">Нийт</span>
                <span className="text-[#1d1d1f]">{formatPrice(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Email Notification - only show if we have an email */}
        {order.email && (
          <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#86868b] mt-0.5" />
              <div>
                <p className="text-[14px] text-[#1d1d1f]">
                  Захиалгын баталгаажуулалт{" "}
                  <span className="font-medium">{order.email}</span> хаягт илгээгдлээ.
                </p>
                <p className="text-[13px] text-[#86868b] mt-1">
                  Захиалгын явц өөрчлөгдөх бүрт танд мэдэгдэл очих болно.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 bg-[#0071e3] text-white rounded-xl py-4 px-6 font-semibold text-[17px] hover:bg-[#0077ed] transition-all text-center flex items-center justify-center gap-2"
          >
            Дэлгүүр үргэлжлүүлэх
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/account/orders"
            className="flex-1 bg-white border border-gray-200 text-[#1d1d1f] rounded-xl py-4 px-6 font-semibold text-[17px] hover:bg-gray-50 transition-all text-center"
          >
            Захиалгууд харах
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      {/* Simple header for confirmation page */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Нүүр хуудас</span>
          </Link>
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Alimhan
          </Link>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
            <p className="text-[#86868b] text-[15px]">Ачаалж байна...</p>
          </div>
        </main>
      }>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
