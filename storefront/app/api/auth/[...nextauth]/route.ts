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
            // Get customer details
            const customerResponse = await fetch(
              `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`,
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
      // For OAuth providers (Google), allow sign-in
      // In a production app, you'd want to use Medusa's OAuth module to link accounts
      if (account?.provider === "google" && user.email) {
        // Google sign-in - user will be created/linked in Medusa separately if needed
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      const extendedToken = token as ExtendedToken;
      if (user) {
        const extendedUser = user as ExtendedUser;
        extendedToken.id = user.id;
        extendedToken.email = user.email;
        extendedToken.name = user.name;
        extendedToken.picture = user.image;
        if (extendedUser.accessToken) {
          extendedToken.accessToken = extendedUser.accessToken;
        }
      }
      if (account) {
        extendedToken.provider = account.provider;
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
        extendedSession.accessToken = extendedToken.accessToken;
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
