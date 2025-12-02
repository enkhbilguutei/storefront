"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ChevronRight, Loader2, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  display_id: number;
  status: string;
  created_at: string;
  total: number;
  currency_code: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    thumbnail?: string;
  }[];
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      if (!session) return;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me/orders`,
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
          throw new Error("Захиалгуудыг татахад алдаа гарлаа");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [session]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Хүлээгдэж буй",
      completed: "Дууссан",
      archived: "Архивлагдсан",
      canceled: "Цуцлагдсан",
      requires_action: "Үйлдэл шаардлагатай",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
      canceled: "bg-red-100 text-red-800",
      requires_action: "bg-orange-100 text-orange-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/40 mb-4" />
        <p className="text-secondary">Захиалгуудыг татаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Захиалга байхгүй</h2>
          <p className="text-secondary mb-6">
            Та одоогоор захиалга хийгээгүй байна. Бүтээгдэхүүнүүдээс сонгоорой!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
          >
            <Package className="h-5 w-5" />
            Бүтээгдэхүүн үзэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-1">Миний захиалгууд</h2>
        <p className="text-secondary text-sm">Нийт {orders.length} захиалга</p>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-secondary">Захиалгын дугаар</p>
              <p className="font-semibold text-foreground">#{order.display_id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{item.title}</p>
                  <p className="text-xs text-secondary">x{item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <span className="text-sm text-secondary">+{order.items.length - 3} бусад</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-secondary">{formatDate(order.created_at)}</p>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(order.total / 100, order.currency_code)}
              </p>
            </div>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Дэлгэрэнгүй
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
