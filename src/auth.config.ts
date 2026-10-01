import type { NextAuthConfig } from "next-auth";

type Role = "CANDIDATE" | "EMPLOYER";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role = (auth?.user as { role?: Role } | undefined)?.role;
      const path = nextUrl.pathname;
      if (path.startsWith("/candidate")) return role === "CANDIDATE";
      if (path.startsWith("/employer")) return role === "EMPLOYER";
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as { id?: string; role?: Role }).id = token.id as string;
      (session.user as { id?: string; role?: Role }).role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;