import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "change-me-to-a-long-secret-in-production",
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    ...(hasGoogleCredentials
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user?.email) {
        return true;
      }

      const email = user.email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        user.id = existingUser.id;
        return true;
      }

      const generatedPassword = await bcrypt.hash(
        `${Date.now()}-${Math.random()}-${process.env.NEXTAUTH_SECRET ?? "fair-interviews"}`,
        10
      );

      const createdUser = await prisma.user.create({
        data: {
          email,
          name: user.name ?? profile?.name ?? email.split("@")[0],
          password: generatedPassword,
        },
      });

      user.id = createdUser.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const jwtToken = token as typeof token & { userId?: string };
        jwtToken.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      const typedToken = token as typeof token & { userId?: string };
      const typedSession = session as typeof session & {
        user: typeof session.user & { id?: string };
      };

      if (typedSession.user && typedToken.userId) {
        typedSession.user.id = typedToken.userId;
      }

      return typedSession;
    },
  },
});
