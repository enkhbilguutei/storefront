"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ChevronRight, Loader2, ShoppingBag, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// Metadata: Захиалгууд | Миний бүртгэл (set in parent layout)

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price?: number;
  product_title?: string;
  variant_title?: string;
}

interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status?: string;
  payment_status?: string;
  created_at: string;
  total: number;
  currency_code: string;
  items: OrderItem[];
  payment_method?: string;
}

export default function OrdersPage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tokenRefreshed, setTokenRefreshed] = useState(false);

  // Auto-refresh session for OAuth users without token
  useEffect(() => {
    async function refreshSessionIfNeeded() {
      if (!session || tokenRefreshed) return;
      
      const accessToken = (session as { accessToken?: string }).accessToken;
      const provider = (session as { user?: { provider?: string } }).user?.provider;
      
      if (!accessToken && provider === "google") {
        try {
          await update();
          setTokenRefreshed(true);
        } catch (error) {
          console.error("Session refresh failed:", error);
        }
      }
    }
    
    if (sessionStatus !== "loading") {
      refreshSessionIfNeeded();
    }
  }, [session, sessionStatus, update, tokenRefreshed]);

  useEffect(() => {
    async function fetchOrders() {
      if (sessionStatus === "loading") return;
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      const accessToken = (session as { accessToken?: string }).accessToken;

      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch orders with items expanded
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/custom/orders?limit=50&order=-created_at`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Silently redirect to login
            window.location.href = "/auth/login";
            return;
          }
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || response.statusText };
          }
          
          console.error("Orders fetch error:", response.status, errorData);
          throw new Error("Захиалгуудыг татахад алдаа гарлаа");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [session, sessionStatus]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Хүлээгдэж буй",
      completed: "Биелсэн",
      archived: "Архивлагдсан",
      canceled: "Цуцлагдсан",
      requires_action: "Үйлдэл шаардлагатай",
      not_fulfilled: "Бэлтгэгдээгүй",
      fulfilled: "Бэлтгэгдсэн",
      shipped: "Хүргэлтэнд гарсан",
      delivered: "Хүргэгдсэн",
      partially_fulfilled: "Хэсэгчлэн бэлтгэгдсэн",
      partially_shipped: "Хэсэгчлэн хүргэлтэнд гарсан",
      paid: "Төлбөр төлөгдсөн",
      awaiting_payment: "Төлбөр хүлээгдэж буй",
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "fulfilled":
      case "shipped":
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "canceled":
        return <XCircle className="h-4 w-4" />;
      case "requires_action":
      case "awaiting_payment":
        return <AlertCircle className="h-4 w-4" />;
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
      archived: "bg-gray-50 text-gray-600 border-gray-200",
      canceled: "bg-red-50 text-red-700 border-red-200",
      requires_action: "bg-orange-50 text-orange-700 border-orange-200",
      not_fulfilled: "bg-gray-50 text-gray-600 border-gray-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colorMap[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getPaymentMethodText = (method?: string) => {
    if (!method) return "Төлбөрийн мэдээлэл байхгүй";
    if (method.includes("qpay")) return "QPay";
    if (method === "bank_transfer" || method.includes("manual") || method.includes("system_default")) return "Дансаар шилжүүлэх";
    if (method === "cash_on_delivery") return "Бэлнээр / QPay";
    return method;
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderDisplayStatus = (order: Order) => {
    if (order.status === "canceled") return "canceled";
    if (order.status === "archived") return "archived";
    if (order.status === "requires_action") return "requires_action";
    
    // Prioritize delivered first (most complete state)
    if (order.fulfillment_status === "delivered") return "delivered";
    if (order.fulfillment_status === "shipped") return "shipped";
    if (order.fulfillment_status === "partially_shipped") return "partially_shipped";
    if (order.fulfillment_status === "fulfilled") return "fulfilled";
    if (order.fulfillment_status === "partially_fulfilled") return "partially_fulfilled";
    
    // If payment is captured but not fulfilled
    if (order.payment_status === "captured" || order.payment_status === "partially_captured") {
        return "paid";
    }
    
    if (order.payment_status === "awaiting" || order.payment_status === "authorized" || order.payment_status === "awaiting_payment" || order.payment_status === "not_paid") {
        return "awaiting_payment";
    }

    return order.status;
  };

  const getItemDisplayTitle = (item: OrderItem) => {
    return item.product_title || item.title;
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/30 mb-3" />
        <p className="text-sm text-secondary">Захиалгуудыг татаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
          >
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Захиалга байхгүй</h2>
        <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">
          Та одоогоор захиалга хийгээгүй байна
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm rounded-lg hover:bg-foreground/90 transition-colors"
        >
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Захиалгууд</h2>
          <p className="text-sm text-secondary">{orders.length} захиалга</p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const displayStatus = getOrderDisplayStatus(order);
          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-medium text-foreground">#{order.display_id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                      {getStatusIcon(displayStatus)}
                      {getStatusText(displayStatus)}
                    </span>
                  </div>
                  
                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-3">
                    {order.items?.slice(0, 4).map((item, idx) => (
                      <div key={item.id || idx} className="relative">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={item.thumbnail} 
                            alt={getItemDisplayTitle(item)}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <span className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-secondary">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-secondary">{formatDate(order.created_at)}</span>
                    <span className="text-secondary border-l border-gray-200 pl-4">
                      {getPaymentMethodText(order.payment_method)}
                    </span>
                    <span className="font-medium text-foreground border-l border-gray-200 pl-4">
                      {formatPrice(order.total, order.currency_code)}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-foreground transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
