import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// Extend types for custom properties
interface ExtendedUser extends User {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
  user: Session["user"] & {
    id?: string;
    provider?: string;
  };
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  provider?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Authenticate with Medusa backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.token) {
            // If customer data is returned with token, use it
            if (data.customer) {
              return {
                id: data.customer.id,
                email: data.customer.email,
                name: `${data.customer.first_name || ""} ${data.customer.last_name || ""}`.trim(),
                accessToken: data.token,
              };
            }

            // Fallback: Get customer details
            const customerResponse = await fetch(
              `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/custom/me`,
              {
                headers: {
                  Authorization: `Bearer ${data.token}`,
                  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
              }
            );

            if (customerResponse.ok) {
              const customerData = await customerResponse.json();
              return {
                id: customerData.customer.id,
                email: customerData.customer.email,
                name: `${customerData.customer.first_name || ""} ${customerData.customer.last_name || ""}`.trim(),
                accessToken: data.token,
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (Google), create/link customer in Medusa
      if (account?.provider === "google" && user.email) {
        try {
          console.log("[NextAuth] Google sign-in detected, calling OAuth endpoint for:", user.email);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/oauth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                provider: "google",
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("[NextAuth] OAuth token received, length:", data.token?.length);
            // Store token in user object for jwt callback
            (user as ExtendedUser).accessToken = data.token;
          } else {
            const errorText = await response.text();
            console.error("[NextAuth] Failed to create OAuth customer:", response.status, errorText);
          }
        } catch (error) {
          console.error("[NextAuth] Error creating OAuth customer:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      const extendedToken = token as ExtendedToken;
      
      if (user) {
        const extendedUser = user as ExtendedUser;
        extendedToken.id = user.id;
        extendedToken.email = user.email;
        extendedToken.name = user.name;
        extendedToken.picture = user.image;
        if (extendedUser.accessToken) {
          console.log("[NextAuth JWT] Storing accessToken from user object, length:", extendedUser.accessToken.length);
          extendedToken.accessToken = extendedUser.accessToken;
        }
      }
      
      if (account) {
        extendedToken.provider = account.provider;
        console.log("[NextAuth JWT] Provider set to:", account.provider);
      }
      
      // Get/refresh token for Google OAuth users if missing
      if (extendedToken.provider === "google" && !extendedToken.accessToken && token.email) {
        console.log("[NextAuth JWT] No accessToken found, fetching from OAuth endpoint for:", token.email);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/oauth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: token.email,
                name: token.name,
                provider: "google",
              }),
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            extendedToken.accessToken = data.token;
            console.log("[NextAuth JWT] Token fetched successfully, length:", data.token.length);
          } else {
            console.error("[NextAuth JWT] Failed to get OAuth token:", response.status, await response.text());
          }
        } catch (error) {
          console.error("[NextAuth JWT] Error getting OAuth token:", error);
        }
      } else if (extendedToken.accessToken) {
        console.log("[NextAuth JWT] Token already exists, length:", extendedToken.accessToken.length);
      }
      
      return extendedToken;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;
      const extendedSession = session as ExtendedSession;
      
      if (extendedSession.user) {
        extendedSession.user.id = extendedToken.id as string;
        extendedSession.user.provider = extendedToken.provider;
        extendedSession.user.image = extendedToken.picture as string | undefined;
      }
      if (extendedToken.accessToken) {
        console.log("[NextAuth Session] Adding accessToken to session, length:", extendedToken.accessToken.length);
        extendedSession.accessToken = extendedToken.accessToken;
      } else {
        console.warn("[NextAuth Session] No accessToken in token for user:", extendedToken.email);
      }
      return extendedSession;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
