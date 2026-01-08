"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { z } from "zod";
import Link from "next/link";
import { Check, Loader2, Pencil, Mail, Phone, User, Shield, ChevronRight, Package, Clock } from "lucide-react";
import { profileUpdateSchema } from "@/lib/validations";
import { sanitizePhoneNumber } from "@/lib/utils/phone";
import { formatRelativeDate } from "@/lib/utils/date";
import { formatPrice } from "@/lib/utils/price";

// Metadata is set in parent layout

interface RecentOrder {
  id: string;
  display_id: number;
  status: string;
  created_at: string;
  total: number;
  currency_code: string;
}

interface CustomerData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export default function AccountPage() {
  const { user } = useUserStore();
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
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
    
    refreshSessionIfNeeded();
  }, [session, update, tokenRefreshed]);

  // Fetch customer data from backend
  useEffect(() => {
    async function fetchCustomerData() {
      if (!session) {
        setIsFetchingCustomer(false);
        return;
      }
      
      const accessToken = (session as { accessToken?: string }).accessToken;
      if (!accessToken) {
        // Silently wait for token refresh, no error shown
        setIsFetchingCustomer(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/custom/me`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setCustomerData(data.customer);
          setFormData({
            firstName: data.customer.first_name || "",
            lastName: data.customer.last_name || "",
            phone: data.customer.phone || "",
          });
          setError(""); // Clear any previous errors
        } else if (response.status === 401) {
          // Silently redirect to login instead of showing error
          window.location.href = "/auth/login";
          return;
        }
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      } finally {
        setIsFetchingCustomer(false);
      }
    }

    fetchCustomerData();
  }, [session]);

  // Fetch recent orders
  useEffect(() => {
    async function fetchRecentOrders() {
      if (!session) {
        setOrdersLoading(false);
        return;
      }
      
      try {
        // Use custom endpoint for orders since SDK might not have it
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/custom/orders?limit=3&order=-created_at`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRecentOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchRecentOrders();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const validatedData = profileUpdateSchema.parse(formData);
      
      const accessToken = (session as { accessToken?: string })?.accessToken;
      if (!accessToken) {
        window.location.href = "/auth/login";
        return;
      }
      
      // Prepare the update payload
      const updatePayload: {
        first_name: string;
        last_name: string;
        phone?: string;
      } = {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
      };
      
      // Only include phone if it's not empty
      if (validatedData.phone && validatedData.phone.trim() !== "") {
        updatePayload.phone = validatedData.phone;
      }
      
      console.log("Updating customer with:", updatePayload);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/custom/me`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );
      
      if (response.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Мэдээлэл шинэчлэхэд алдаа гарлаа");
      }
      
      const data = await response.json();
      console.log("Update response:", data);
      
      if (data.customer) {
        setCustomerData(data.customer);
      }
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
    } finally {
      setIsLoading(false);
    }
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Өнөөдөр";
    if (diffDays === 1) return "Өчигдөр";
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
    
    return date.toLocaleDateString("mn-MN", { month: "short", day: "numeric" });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Хүлээгдэж буй",
      completed: "Биелсэн",
      canceled: "Цуцлагдсан",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Хувийн мэдээлэл</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors min-h-11 px-2"
            >
              <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">Засах</span>
            </button>
          )}
        </div>

        <div className="p-3 sm:p-4">
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg mb-4 text-sm">
              <Check className="h-4 w-4" />
              Мэдээлэл амжилттай шинэчлэгдлээ
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-secondary mb-1.5">Овог</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
                    placeholder="Овог"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-secondary mb-1.5">Нэр</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
                    placeholder="Нэр"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-secondary mb-1.5">Утас (заавал биш)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = sanitizePhoneNumber(e.target.value);
                    setFormData({ ...formData, phone: value });
                  }}
                  maxLength={8}
                  pattern="[0-9]{8}"
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition-all"
                  placeholder="99112233"
                />
                <p className="text-xs text-secondary mt-1">8 оронтой тоо оруулна уу</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-secondary mb-1.5">Имэйл</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-100 rounded-lg bg-gray-50 text-secondary cursor-not-allowed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 sm:py-2.5 text-sm sm:text-base min-h-12 border border-gray-200 text-foreground rounded-lg hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-sm sm:text-base min-h-12 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden xs:inline">Хадгалж байна...</span>
                      <span className="xs:hidden">Хадгалж...</span>
                    </>
                  ) : (
                    "Хадгалах"
                  )}
                </button>
              </div>
            </form>
          ) : isFetchingCustomer ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 py-2.5 sm:py-2">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-xs text-secondary">Нэр</p>
                  <p className="text-sm sm:text-sm font-medium text-foreground wrap-break-word">
                    {customerData?.last_name && customerData?.first_name 
                      ? `${customerData.last_name} ${customerData.first_name}`
                      : user?.lastName && user?.firstName 
                        ? `${user.lastName} ${user.firstName}`
                        : user?.name || "-"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 py-2.5 sm:py-2">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-xs text-secondary">Имэйл</p>
                  <p className="text-sm sm:text-sm font-medium text-foreground break-all">{customerData?.email || user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2.5 sm:py-2">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-xs text-secondary">Утас</p>
                  <p className="text-sm sm:text-sm font-medium text-foreground">{customerData?.phone || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Type */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-xs text-secondary">Бүртгэлийн төрөл</p>
            <p className="text-sm sm:text-sm font-medium text-foreground">
              {(session?.user as { provider?: string })?.provider === "google" ? "Google" : "Имэйл"}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Сүүлийн захиалгууд</h2>
          <Link 
            href="/account/orders"
            className="text-sm text-secondary hover:text-foreground transition-colors min-h-11 flex items-center px-2"
          >
            Бүгдийг харах
          </Link>
        </div>

        <div className="p-3 sm:p-4">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-secondary mb-3">Захиалга байхгүй</p>
              <Link
                href="/products"
                className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
              >
                Бүтээгдэхүүн үзэх
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between p-3 sm:p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors group min-h-16"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-sm font-medium text-foreground">#{order.display_id}</p>
                      <p className="text-xs text-secondary">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm sm:text-sm font-medium text-foreground whitespace-nowrap">
                        {formatPrice(order.total, order.currency_code)}
                      </p>
                      <p className="text-xs text-secondary whitespace-nowrap">{getStatusText(order.status)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4 text-gray-300 group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
