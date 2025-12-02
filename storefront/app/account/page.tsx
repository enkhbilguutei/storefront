"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { Check, Loader2, Edit2 } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "Нэр оруулна уу"),
  lastName: z.string().min(1, "Овог оруулна уу"),
  phone: z.string().optional(),
});

export default function AccountPage() {
  const { user } = useUserStore();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const validatedData = profileSchema.parse(formData);
      
      // Update customer in Medusa
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session && { Authorization: `Bearer ${(session as { accessToken?: string }).accessToken}` }),
          },
          body: JSON.stringify({
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            phone: validatedData.phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Мэдээлэл шинэчлэхэд алдаа гарлаа");
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Профайл мэдээлэл</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Засах
            </button>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl mb-6">
            <Check className="h-5 w-5" />
            Мэдээлэл амжилттай шинэчлэгдлээ
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Нэр
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                  placeholder="Нэр"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Овог
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                  placeholder="Овог"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Утас
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                placeholder="9911 2233"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Имэйл
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-secondary cursor-not-allowed"
              />
              <p className="text-xs text-secondary mt-1">Имэйл хаягийг өөрчлөх боломжгүй</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  "Хадгалах"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary mb-1">Нэр</p>
                <p className="font-medium text-foreground">{user?.firstName || "-"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary mb-1">Овог</p>
                <p className="font-medium text-foreground">{user?.lastName || "-"}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-secondary mb-1">Имэйл</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Бүртгэлийн мэдээлэл</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-secondary mb-1">Бүртгэлийн төрөл</p>
            <p className="font-medium text-foreground">
              {(session?.user as { provider?: string })?.provider === "google" ? "Google" : "Имэйл"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-secondary mb-1">Бүртгэлийн ID</p>
            <p className="font-medium text-foreground text-sm truncate">{user?.id || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
