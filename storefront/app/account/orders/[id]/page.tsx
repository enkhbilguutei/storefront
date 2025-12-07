"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Package, Loader2, MapPin, 
  Clock, CheckCircle2, XCircle, AlertCircle, Truck
} from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price?: number;
  product_title?: string;
  variant_title?: string;
  total?: number;
}

interface OrderAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
}

interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status?: string;
  payment_status?: string;
  created_at: string;
  total: number;
  subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  discount_total?: number;
  currency_code: string;
  items: OrderItem[];
  shipping_address?: OrderAddress;
  email?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      if (sessionStatus === "loading") return;
      if (!session || !params.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/orders/${params.id}?fields=*items,*shipping_address`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              Authorization: `Bearer ${(session as { accessToken?: string }).accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Захиалга олдсонгүй");
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [session, sessionStatus, params.id]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Хүлээгдэж буй",
      completed: "Биелсэн",
      archived: "Архивлагдсан",
      canceled: "Цуцлагдсан",
      requires_action: "Үйлдэл шаардлагатай",
      not_fulfilled: "Бэлтгэгдээгүй",
      fulfilled: "Бэлтгэгдсэн",
      shipped: "Илгээгдсэн",
      delivered: "Хүргэгдсэн",
      partially_fulfilled: "Хэсэгчлэн бэлтгэгдсэн",
      not_paid: "Төлөгдөөгүй",
      awaiting: "Хүлээгдэж буй",
      captured: "Төлөгдсөн",
      authorized: "Баталгаажсан",
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "fulfilled":
      case "captured":
        return <CheckCircle2 className="h-4 w-4" />;
      case "canceled":
        return <XCircle className="h-4 w-4" />;
      case "requires_action":
        return <AlertCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      captured: "bg-emerald-50 text-emerald-700 border-emerald-200",
      authorized: "bg-blue-50 text-blue-700 border-blue-200",
      archived: "bg-gray-50 text-gray-600 border-gray-200",
      canceled: "bg-red-50 text-red-700 border-red-200",
      requires_action: "bg-orange-50 text-orange-700 border-orange-200",
      not_fulfilled: "bg-gray-50 text-gray-600 border-gray-200",
      not_paid: "bg-amber-50 text-amber-700 border-amber-200",
      awaiting: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colorMap[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/30 mb-3" />
        <p className="text-sm text-secondary">Захиалгыг татаж байна...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error || "Захиалга олдсонгүй"}</p>
          <button 
            onClick={() => router.push("/account/orders")}
            className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
          >
            Захиалгууд руу буцах
          </button>
        </div>
      </div>
    );
  }

  const displayStatus = order.fulfillment_status || order.status;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => router.push("/account/orders")}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Захиалга #{order.display_id}</h1>
          <p className="text-sm text-secondary">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-secondary mb-1">Захиалгын төлөв</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(displayStatus)}`}>
              {getStatusIcon(displayStatus)}
              {getStatusText(displayStatus)}
            </span>
          </div>
          {order.payment_status && (
            <div>
              <p className="text-xs text-secondary mb-1">Төлбөрийн төлөв</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.payment_status)}`}>
                {getStatusIcon(order.payment_status)}
                {getStatusText(order.payment_status)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-foreground">Бүтээгдэхүүнүүд</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-4 p-4">
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={item.thumbnail} 
                  alt={item.product_title || item.title}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.product_title || item.title}</p>
                {item.variant_title && (
                  <p className="text-xs text-secondary">{item.variant_title}</p>
                )}
                <p className="text-xs text-secondary mt-1">Тоо ширхэг: {item.quantity}</p>
              </div>
              {item.unit_price && (
                <p className="text-sm font-medium text-foreground">
                  {formatPrice(item.unit_price * item.quantity, order.currency_code)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="font-semibold text-foreground mb-4">Дүн</h2>
        <div className="space-y-2 text-sm">
          {order.subtotal !== undefined && (
            <div className="flex justify-between">
              <span className="text-secondary">Дүн</span>
              <span className="text-foreground">{formatPrice(order.subtotal, order.currency_code)}</span>
            </div>
          )}
          {order.shipping_total !== undefined && order.shipping_total > 0 && (
            <div className="flex justify-between">
              <span className="text-secondary">Хүргэлт</span>
              <span className="text-foreground">{formatPrice(order.shipping_total, order.currency_code)}</span>
            </div>
          )}
          {order.discount_total !== undefined && order.discount_total > 0 && (
            <div className="flex justify-between">
              <span className="text-secondary">Хөнгөлөлт</span>
              <span className="text-emerald-600">-{formatPrice(order.discount_total, order.currency_code)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="font-medium text-foreground">Нийт</span>
            <span className="font-semibold text-foreground">{formatPrice(order.total, order.currency_code)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-foreground">Хүргэлтийн хаяг</h2>
          </div>
          <div className="text-sm text-secondary space-y-1">
            {order.shipping_address.first_name && order.shipping_address.last_name && (
              <p className="font-medium text-foreground">
                {order.shipping_address.last_name} {order.shipping_address.first_name}
              </p>
            )}
            {order.shipping_address.address_1 && <p>{order.shipping_address.address_1}</p>}
            {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
            {(order.shipping_address.city || order.shipping_address.province) && (
              <p>
                {[order.shipping_address.city, order.shipping_address.province].filter(Boolean).join(", ")}
              </p>
            )}
            {order.shipping_address.postal_code && <p>{order.shipping_address.postal_code}</p>}
            {order.shipping_address.phone && <p>Утас: {order.shipping_address.phone}</p>}
          </div>
        </div>
      )}

      {/* Back to orders */}
      <Link
        href="/account/orders"
        className="flex items-center justify-center gap-2 p-3 text-sm text-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Захиалгууд руу буцах
      </Link>
    </div>
  );
}
