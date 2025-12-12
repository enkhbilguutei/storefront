"use client";

import { useState, useEffect } from "react";
import { API_KEY, API_URL } from "@/lib/config/api";
import Image from "next/image";
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface QPayInvoiceUrl {
  name: string;
  description: string;
  logo?: string;
  link: string;
}

interface QPayInvoiceData {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  short_url?: string;
  urls: QPayInvoiceUrl[];
}

interface QPayPaymentProps {
  orderId?: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onPaymentSuccess?: () => void;
  onPaymentFailed?: (error: string) => void;
}

// Bank logo mappings with CDN URLs (official or well-known sources)
const BANK_LOGOS: Record<string, { logo: string; color: string }> = {
  // Khan Bank
  "khanbank": {
    logo: "https://play-lh.googleusercontent.com/dKpHVz5kq0_PNvwDpHYxQo7Zzpki0PoZ_wjqrPGHEeY8VvKvSbKxmP8OjQFg5xXGUQ=w240-h480-rw",
    color: "#00A651",
  },
  "khan bank": {
    logo: "https://play-lh.googleusercontent.com/dKpHVz5kq0_PNvwDpHYxQo7Zzpki0PoZ_wjqrPGHEeY8VvKvSbKxmP8OjQFg5xXGUQ=w240-h480-rw",
    color: "#00A651",
  },
  // State Bank
  "statebank": {
    logo: "https://play-lh.googleusercontent.com/HvPnOOVBHlYoJcNi0b_YYkbQzgmZGj_EIpRNFNVILfXxvPOdLkJrGTnX5fDxqM5KXA=w240-h480-rw",
    color: "#003366",
  },
  "state bank": {
    logo: "https://play-lh.googleusercontent.com/HvPnOOVBHlYoJcNi0b_YYkbQzgmZGj_EIpRNFNVILfXxvPOdLkJrGTnX5fDxqM5KXA=w240-h480-rw",
    color: "#003366",
  },
  // Xac Bank (Хас банк)
  "xacbank": {
    logo: "https://play-lh.googleusercontent.com/p0zzr6y0X8mDQC8TMjrqBMAV8r7sV0cX_7D3xOxNjXmDGPh7GRAkVxjfuDq0Z4BhiA=w240-h480-rw",
    color: "#E31E24",
  },
  "xac bank": {
    logo: "https://play-lh.googleusercontent.com/p0zzr6y0X8mDQC8TMjrqBMAV8r7sV0cX_7D3xOxNjXmDGPh7GRAkVxjfuDq0Z4BhiA=w240-h480-rw",
    color: "#E31E24",
  },
  // TDB Bank
  "tdbbank": {
    logo: "https://play-lh.googleusercontent.com/m9nSPXbz5wXGF9Jg6X3h3H7QxMj8J4A8T4wPkC8KGqA9yMLqeE9_8kPIZhZR5TH8Ag=w240-h480-rw",
    color: "#0066B3",
  },
  "trade and development bank": {
    logo: "https://play-lh.googleusercontent.com/m9nSPXbz5wXGF9Jg6X3h3H7QxMj8J4A8T4wPkC8KGqA9yMLqeE9_8kPIZhZR5TH8Ag=w240-h480-rw",
    color: "#0066B3",
  },
  // Golomt Bank
  "golomtbank": {
    logo: "https://play-lh.googleusercontent.com/qQ5-gTGrPb0M5wZ0QKXChGKKNlWNzMjJKGMr0t8AYbHlM5vfpMNONa5YGHTWnCRLEQ=w240-h480-rw",
    color: "#004B8D",
  },
  "golomt bank": {
    logo: "https://play-lh.googleusercontent.com/qQ5-gTGrPb0M5wZ0QKXChGKKNlWNzMjJKGMr0t8AYbHlM5vfpMNONa5YGHTWnCRLEQ=w240-h480-rw",
    color: "#004B8D",
  },
  // Most Money (Мост мони)
  "most": {
    logo: "https://play-lh.googleusercontent.com/aD5fkYyqE_xqKVZXFzLVLqCvxXhfz7z6rZPPZQfXJqD5KRRB5pYxKQvKw9z8xVOhFw=w240-h480-rw",
    color: "#FF6B00",
  },
  "most money": {
    logo: "https://play-lh.googleusercontent.com/aD5fkYyqE_xqKVZXFzLVLqCvxXhfz7z6rZPPZQfXJqD5KRRB5pYxKQvKw9z8xVOhFw=w240-h480-rw",
    color: "#FF6B00",
  },
  // National Investment Bank
  "nibank": {
    logo: "https://play-lh.googleusercontent.com/JI-EbZvTrMhvqy0b-QVNOKZRzq6w9bC9y3mZKQK7yNJ7fKgx5g0M4Qi3N9Sq8DqbXQ=w240-h480-rw",
    color: "#1E3A8A",
  },
  "national investment bank": {
    logo: "https://play-lh.googleusercontent.com/JI-EbZvTrMhvqy0b-QVNOKZRzq6w9bC9y3mZKQK7yNJ7fKgx5g0M4Qi3N9Sq8DqbXQ=w240-h480-rw",
    color: "#1E3A8A",
  },
  // Chinggis Khaan Bank
  "ckbank": {
    logo: "https://play-lh.googleusercontent.com/TcJ9lXi0C3Y_H1Zh_n7L8K0KZ1xQvqN0tFXjJGlHNIQ8wAoImGY8E8jNDFCWCENwQzE=w240-h480-rw",
    color: "#8B4513",
  },
  "chinggis khaan bank": {
    logo: "https://play-lh.googleusercontent.com/TcJ9lXi0C3Y_H1Zh_n7L8K0KZ1xQvqN0tFXjJGlHNIQ8wAoImGY8E8jNDFCWCENwQzE=w240-h480-rw",
    color: "#8B4513",
  },
  // Capitron Bank
  "capitronbank": {
    logo: "https://play-lh.googleusercontent.com/3vhGKN8qChNm_JZl0TJrX-X1qQJNgPIpTX-8ZqZnGGMdQV3iZ4HlQj8HYXwlL8Pq1g=w240-h480-rw",
    color: "#00796B",
  },
  "capitron bank": {
    logo: "https://play-lh.googleusercontent.com/3vhGKN8qChNm_JZl0TJrX-X1qQJNgPIpTX-8ZqZnGGMdQV3iZ4HlQj8HYXwlL8Pq1g=w240-h480-rw",
    color: "#00796B",
  },
  // Bogd Bank
  "bogdbank": {
    logo: "https://play-lh.googleusercontent.com/9PKQ_XJPYNqDpLYZj9XVmT3mXXFnWYHyKYkUJRl9U5jVlYlOz5uQ3_JhQZ0pVzNw=w240-h480-rw",
    color: "#0D47A1",
  },
  "bogd bank": {
    logo: "https://play-lh.googleusercontent.com/9PKQ_XJPYNqDpLYZj9XVmT3mXXFnWYHyKYkUJRl9U5jVlYlOz5uQ3_JhQZ0pVzNw=w240-h480-rw",
    color: "#0D47A1",
  },
  // M Bank
  "mbank": {
    logo: "https://play-lh.googleusercontent.com/2cXNKIq5QVBXdqUkJp7kQqH3L1wqmKlDGzAJYJQ1qWmQxTLnPq7xf5xmOZx-0Dh_=w240-h480-rw",
    color: "#E91E63",
  },
  // SocialPay
  "socialpay": {
    logo: "https://play-lh.googleusercontent.com/9N9sDsVUqy7gqhQXGdJLIQ3rkxPXUhPe3Kj0T_4Q3lQVZ1qZCKxDcjLBXJRBpCKqUw=w240-h480-rw",
    color: "#00BCD4",
  },
  // MonPay / Candy Pay
  "candypay": {
    logo: "https://play-lh.googleusercontent.com/TYnJFGmYKFvPX-3hqHUZE3Fl5O9z0YXU6HlWVPVG_5JgzLQpU3lQ5xhN7nQE1eXDsg=w240-h480-rw",
    color: "#FF4081",
  },
  "candy pay": {
    logo: "https://play-lh.googleusercontent.com/TYnJFGmYKFvPX-3hqHUZE3Fl5O9z0YXU6HlWVPVG_5JgzLQpU3lQ5xhN7nQE1eXDsg=w240-h480-rw",
    color: "#FF4081",
  },
  // QPay
  "qpay": {
    logo: "https://qpay.mn/q-logo.png",
    color: "#00D4AA",
  },
};

// Get bank logo by name (case insensitive)
function getBankLogo(name: string): { logo: string; color: string } | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct match
  if (BANK_LOGOS[normalizedName]) {
    return BANK_LOGOS[normalizedName];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(BANK_LOGOS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
}

const BACKEND_URL = API_URL;
const PUBLISHABLE_KEY = API_KEY;

export function QPayPayment({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onPaymentFailed,
}: QPayPaymentProps) {
  const [invoice, setInvoice] = useState<QPayInvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");

  const createInvoice = async () => {
    if (!orderId || !amount) {
      setError("Захиалгын мэдээлэл дутуу байна");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/store/qpay/create-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount,
          description: `Захиалга #${orderId}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "QPay нэхэмжлэл үүсгэхэд алдаа гарлаа");
      }

      setInvoice(data.invoice);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(message);
      onPaymentFailed?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create invoice on mount if we have orderId
  useEffect(() => {
    if (orderId && amount && !invoice) {
      createInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, amount]);

  // Check payment status periodically (only after invoice is created)
  useEffect(() => {
    if (!invoice || paymentStatus !== "pending") return;

    // Note: QPay recommends using callbacks, not polling
    // This is just for demo/testing purposes
    const checkPayment = async () => {
      setIsCheckingPayment(true);
      try {
        // In production, the callback will handle this
        // For demo, we could poll the backend
        // const response = await fetch(...);
        // if (response.payment_status === "PAID") {
        //   setPaymentStatus("paid");
        // }
      } finally {
        setIsCheckingPayment(false);
      }
    };

    // Check every 10 seconds (for demo only - use callbacks in production)
    const interval = setInterval(checkPayment, 10000);
    return () => clearInterval(interval);
  }, [invoice, paymentStatus, setPaymentStatus]);

  // Handle successful payment callback
  useEffect(() => {
    if (paymentStatus === "paid") {
      onPaymentSuccess?.();
    }
  }, [paymentStatus, onPaymentSuccess]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
        <p className="text-[14px] text-[#86868b]">QPay нэхэмжлэл үүсгэж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-xl space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-medium text-red-800">{error}</p>
            <p className="text-[13px] text-red-600 mt-1">
              QPay үйлчилгээ түр ажиллахгүй байна. Өөр төлбөрийн хэлбэр сонгоно уу.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={createInvoice}
          className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-[#0071e3] hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Дахин оролдох
        </button>
      </div>
    );
  }

  if (paymentStatus === "paid") {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-green-800">Төлбөр амжилттай!</p>
          <p className="text-[13px] text-[#86868b] mt-1">Таны захиалга баталгаажлаа</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-[14px] text-[#86868b]">Захиалга үүсгэснийхээ дараа QPay нэхэмжлэл гарч ирнэ</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* QPay Header with Logo */}
      <div className="flex items-center justify-center gap-2 pb-3 border-b border-gray-100">
        <Image
          src="https://qpay.mn/q-logo.png"
          alt="QPay"
          width={28}
          height={28}
          className="rounded"
          unoptimized
        />
        <span className="text-[16px] font-semibold text-[#1d1d1f]">QPay төлбөр</span>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center p-5 bg-linear-to-b from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-[14px] font-medium text-[#1d1d1f] mb-4">
          QR код уншуулж төлнө үү
        </p>
        <div className="relative w-52 h-52 bg-white p-3 rounded-xl shadow-md border border-gray-100">
          <Image
            src={invoice.qr_image.startsWith("data:") ? invoice.qr_image : `data:image/png;base64,${invoice.qr_image}`}
            alt="QPay QR Code"
            fill
            className="object-contain p-1"
            unoptimized
          />
        </div>
        <p className="text-[12px] text-[#86868b] mt-4 text-center">
          Банкны апп эсвэл QPay апп-аар уншуулна уу
        </p>
      </div>

      {/* Bank Apps Deep Links */}
      {invoice.urls && invoice.urls.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-[#1d1d1f]">
            Банкны апп-аар төлөх:
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {invoice.urls.map((app, index) => {
              const bankInfo = getBankLogo(app.name);
              const logoUrl = app.logo || bankInfo?.logo;
              
              return (
                <a
                  key={index}
                  href={app.link}
                  className="flex flex-col items-center p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all active:scale-95"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ 
                      backgroundColor: bankInfo?.color ? `${bankInfo.color}10` : '#f5f5f7'
                    }}
                  >
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={app.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <span 
                        className="text-[16px] font-bold"
                        style={{ color: bankInfo?.color || '#1d1d1f' }}
                      >
                        {app.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#86868b] mt-2 text-center line-clamp-2 leading-tight">
                    {app.description || app.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment status indicator */}
      <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
        {isCheckingPayment ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
        <p className="text-[13px] text-amber-800 font-medium">
          Төлбөр хүлээж байна...
        </p>
      </div>

      {/* Info */}
      <p className="text-[12px] text-[#86868b] text-center">
        Төлбөр төлсний дараа хуудас автоматаар шинэчлэгдэнэ
      </p>
    </div>
  );
}

// Component to check if QPay is available
export function useQPayAvailable() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/store/qpay`, {
          headers: {
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
        });
        const data = await response.json();
        setIsAvailable(data.available);
        setIsSandbox(data.sandbox_mode);
      } catch {
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isSandbox };
}
