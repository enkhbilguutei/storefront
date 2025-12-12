import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { API_URL } from "@/lib/config/api";

/**
 * GET /api/auth/refresh-token
 * 
 * Forces a session token refresh for OAuth users
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For OAuth users (Google), get a fresh token from Medusa
    const extendedSession = session as { user: { provider?: string } };
    
    if (extendedSession.user.provider === "google") {
      const response = await fetch(
        `${API_URL}/auth/customer/oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            provider: "google",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ 
          success: true,
          token: data.token,
          message: "Token refreshed successfully" 
        });
      } else {
        return NextResponse.json(
          { error: "Failed to refresh token" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "No refresh needed for credentials provider" 
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
