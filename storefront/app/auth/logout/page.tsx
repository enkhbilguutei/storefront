"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const logout = async () => {
      await signOut({ redirect: false });
      setIsLoggingOut(false);
      setIsDone(true);
    };
    logout();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          {isLoggingOut ? (
            <>
              <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-foreground animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Гарч байна...
              </h1>
              <p className="text-secondary">
                Түр хүлээнэ үү.
              </p>
            </>
          ) : isDone ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Амжилттай гарлаа
              </h1>
              <p className="text-secondary mb-8">
                Та системээс амжилттай гарлаа. Дахин уулзахыг хүсье!
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
                >
                  Нүүр хуудас
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  <LogOut className="h-5 w-5 rotate-180" />
                  Дахин нэвтрэх
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
