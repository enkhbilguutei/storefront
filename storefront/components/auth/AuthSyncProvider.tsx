"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const syncWithSession = useUserStore((state) => state.syncWithSession);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const accessToken = useUserStore((state) => state.accessToken);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    if (status === "loading") return;
    syncWithSession(session);
  }, [session, status, syncWithSession]);
  
  // Fetch wishlist when user is authenticated AND has access token
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchWishlist();
    } else if (!isAuthenticated) {
      // Clear wishlist when user logs out
      clearWishlist();
    }
  }, [isAuthenticated, accessToken, fetchWishlist, clearWishlist]);

  return <>{children}</>;
}
