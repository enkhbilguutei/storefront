"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/lib/store";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const syncWithSession = useUserStore((state) => state.syncWithSession);

  useEffect(() => {
    if (status === "loading") return;
    syncWithSession(session);
  }, [session, status, syncWithSession]);

  return <>{children}</>;
}
