"use client";

import { SessionProvider } from "next-auth/react";
import { AuthSyncProvider } from "@/components/auth/AuthSyncProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { ComparisonBar } from "@/components/products/ComparisonBar";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthSyncProvider>
        {children}
        <AuthModal />
        <ComparisonBar />
      </AuthSyncProvider>
    </SessionProvider>
  );
}
