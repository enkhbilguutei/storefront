"use client";

import { SessionProvider } from "next-auth/react";
import { AuthSyncProvider } from "@/components/auth/AuthSyncProvider";
import { AuthModal } from "@/components/auth/AuthModal";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthSyncProvider>
        {children}
        <AuthModal />
      </AuthSyncProvider>
    </SessionProvider>
  );
}
