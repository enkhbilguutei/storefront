"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Bell, Lock, Trash2, LogOut, 
  Loader2, ChevronRight,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification settings (would be saved to backend in production)
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Мэдэгдэл</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all">
            <div>
              <p className="font-medium text-foreground">Захиалгын мэдэгдэл</p>
              <p className="text-sm text-secondary">Захиалгын төлөвийн өөрчлөлтийг авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all">
            <div>
              <p className="font-medium text-foreground">Урамшууллын мэдэгдэл</p>
              <p className="text-sm text-secondary">Хямдрал, урамшууллын мэдээлэл авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all">
            <div>
              <p className="font-medium text-foreground">Мэдээллийн товхимол</p>
              <p className="text-sm text-secondary">Долоо хоног бүр шинэ мэдээ авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Аюулгүй байдал</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          <button
            onClick={() => router.push("/auth/change-password")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all text-left"
          >
            <div>
              <p className="font-medium text-foreground">Нууц үг солих</p>
              <p className="text-sm text-secondary">Аккаунтын нууц үгээ шинэчлэх</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Session */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Сессион</h2>
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Гарч байна...
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                Гарах
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-red-100">
        <div className="p-6 border-b border-red-100 bg-red-50/50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-red-600">Аюултай бүс</h2>
          </div>
        </div>
        <div className="p-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 transition-all"
            >
              <Trash2 className="h-5 w-5" />
              Бүртгэл устгах
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                <strong>Анхааруулга:</strong> Бүртгэлийг устгаснаар таны бүх мэдээлэл, захиалгын түүх бүрмөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Цуцлах
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement account deletion API
                    alert("Бүртгэл устгах функц хэрэгжээгүй байна");
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  Устгах
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
