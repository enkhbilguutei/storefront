"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Trash2, Edit2, Loader2, Check, Home, Building2 } from "lucide-react";
import { z } from "zod";

const addressSchema = z.object({
  firstName: z.string().min(1, "Нэр оруулна уу"),
  lastName: z.string().min(1, "Овог оруулна уу"),
  phone: z.string().min(8, "Утасны дугаар оруулна уу"),
  address1: z.string().min(1, "Хаяг оруулна уу"),
  address2: z.string().optional(),
  city: z.string().min(1, "Хот/Аймаг оруулна уу"),
  province: z.string().optional(),
});

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  country_code: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchAddresses() {
    if (!session) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me/addresses`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            Authorization: `Bearer ${(session as { accessToken?: string }).accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const validatedData = addressSchema.parse(formData);
      
      const url = editingAddress 
        ? `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me/addresses/${editingAddress.id}`
        : `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me/addresses`;
      
      const method = editingAddress ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          Authorization: `Bearer ${(session as { accessToken?: string }).accessToken}`,
        },
        body: JSON.stringify({
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone: validatedData.phone,
          address_1: validatedData.address1,
          address_2: validatedData.address2,
          city: validatedData.city,
          province: validatedData.province,
          country_code: "mn",
        }),
      });

      if (!response.ok) {
        throw new Error("Хаяг хадгалахад алдаа гарлаа");
      }

      setSuccess(editingAddress ? "Хаяг амжилттай шинэчлэгдлээ" : "Хаяг амжилттай нэмэгдлээ");
      setShowForm(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Энэ хаягийг устгах уу?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            Authorization: `Bearer ${(session as { accessToken?: string }).accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Хаяг устгахад алдаа гарлаа");
      }

      setSuccess("Хаяг амжилттай устгагдлаа");
      fetchAddresses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      firstName: address.first_name,
      lastName: address.last_name,
      phone: address.phone || "",
      address1: address.address_1,
      address2: address.address_2 || "",
      city: address.city,
      province: address.province || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
    setError("");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/40 mb-4" />
        <p className="text-secondary">Хаягуудыг татаж байна...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Миний хаягууд</h2>
          <p className="text-secondary text-sm">Хүргэлтийн хаягуудаа удирдах</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Хаяг нэмэх</span>
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {error && !showForm && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">
            {editingAddress ? "Хаяг засах" : "Шинэ хаяг нэмэх"}
          </h3>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Нэр *
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
                  Овог *
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
                Утас *
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
                Хаяг *
              </label>
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                placeholder="Дүүрэг, хороо, гудамж, байр"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Нэмэлт хаяг
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                placeholder="Орц, давхар, тоот"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Хот/Аймаг *
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all appearance-none cursor-pointer bg-white"
              >
                <option value="">Сонгоно уу</option>
                <option value="Улаанбаатар">Улаанбаатар</option>
                <option value="Дархан-Уул">Дархан-Уул</option>
                <option value="Орхон">Орхон (Эрдэнэт)</option>
                <option value="Архангай">Архангай</option>
                <option value="Баян-Өлгий">Баян-Өлгий</option>
                <option value="Баянхонгор">Баянхонгор</option>
                <option value="Булган">Булган</option>
                <option value="Говь-Алтай">Говь-Алтай</option>
                <option value="Говьсүмбэр">Говьсүмбэр</option>
                <option value="Дорноговь">Дорноговь</option>
                <option value="Дорнод">Дорнод</option>
                <option value="Дундговь">Дундговь</option>
                <option value="Завхан">Завхан</option>
                <option value="Өвөрхангай">Өвөрхангай</option>
                <option value="Өмнөговь">Өмнөговь</option>
                <option value="Сүхбаатар">Сүхбаатар</option>
                <option value="Сэлэнгэ">Сэлэнгэ</option>
                <option value="Төв">Төв</option>
                <option value="Увс">Увс</option>
                <option value="Ховд">Ховд</option>
                <option value="Хөвсгөл">Хөвсгөл</option>
                <option value="Хэнтий">Хэнтий</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
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
        </div>
      )}

      {/* Addresses List */}
      {!showForm && addresses.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Хаяг байхгүй</h2>
            <p className="text-secondary mb-6">
              Хүргэлтийн хаяг нэмэх бол дээрх товчлуур дарна уу.
            </p>
          </div>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {address.is_default_shipping ? (
                    <Home className="h-5 w-5 text-accent" />
                  ) : (
                    <Building2 className="h-5 w-5 text-foreground/40" />
                  )}
                  <span className="font-semibold text-foreground">
                    {address.first_name} {address.last_name}
                  </span>
                </div>
                {address.is_default_shipping && (
                  <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    Үндсэн
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-secondary mb-4">
                <p>{address.address_1}</p>
                {address.address_2 && <p>{address.address_2}</p>}
                <p>{address.city}</p>
                {address.phone && <p className="text-foreground">{address.phone}</p>}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => startEdit(address)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-gray-50 rounded-lg transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  Засах
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
