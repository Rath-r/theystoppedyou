import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;
const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth environment variables (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET or AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET)",
  );
}

if (!authSecret) {
  throw new Error(
    "Missing NEXTAUTH_SECRET or AUTH_SECRET environment variable",
  );
}

export const authOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      // TOTO PRIDÁVAME: povolí prepojenie na tvoj manuálne vytvorený email v DB
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: authSecret,
  session: { strategy: "jwt" as const },
  callbacks: {
    // Pri JWT stratégii musíme ID najprv dostať do tokenu a potom do session
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const nextAuth = NextAuth(authOptions);

export const auth = nextAuth.auth;
export const { GET, POST } = nextAuth.handlers;
