import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Server-side session helper
export async function getSession() {
  return await getServerSession(authOptions);
}

// Server-side auth check
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Check if user is authenticated (server-side)
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

// Extended session type
export interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  accessToken: string;
}

// Auth action types for modal
export type AuthAction = 
  | "checkout"
  | "wishlist"
  | "review"
  | "address"
  | "order"
  | "profile";

// Get action message for auth modal
export function getAuthActionMessage(action: AuthAction): string {
  const messages: Record<AuthAction, string> = {
    checkout: "Захиалга өгөхийн тулд нэвтэрнэ үү",
    wishlist: "Хүслийн жагсаалтад нэмэхийн тулд нэвтэрнэ үү",
    review: "Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү",
    address: "Хаяг хадгалахын тулд нэвтэрнэ үү",
    order: "Захиалгын түүх харахын тулд нэвтэрнэ үү",
    profile: "Профайл засахын тулд нэвтэрнэ үү",
  };
  return messages[action];
}
