import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { withDbRetry, isRetryableDbError } from "@/lib/db-retry";
import { prisma } from "@/lib/prisma";
import type { AuthOptions } from "next-auth/core/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        try {
          const user = await withDbRetry(
            () =>
              prisma.user.findUnique({
                where: { email },
              }),
            { attempts: 6, delayMs: 2500 },
          );

          if (!user) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          if (isRetryableDbError(error)) {
            console.error("[auth] Base de datos no disponible tras reintentos:", error);
            // Código corto: NextAuth lo mete en la URL; mensajes largos rompen signIn() en el cliente.
            throw new Error("DatabaseUnavailable");
          }
          console.error("[auth] Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
