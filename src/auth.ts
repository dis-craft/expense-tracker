import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Shared Password",
      credentials: {
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.password || !credentials?.name) return null;

        const name = credentials.name as string;
        const pwd = credentials.password as string;

        let role: "USER" | "ADMIN" = "USER";

        if (pwd === process.env.ADMIN_PASSWORD) {
          role = "ADMIN";
        } else if (pwd === process.env.USER_PASSWORD) {
          role = "USER";
        } else {
          return null; // Invalid password
        }

        // Upsert user by name
        let user = await prisma.user.findUnique({ where: { name } });
        if (!user) {
          user = await prisma.user.create({ data: { name, role } });
        } else if (user.role !== role) {
          // If they found out the admin password, upgrade them. Or vice versa.
          user = await prisma.user.update({ where: { name }, data: { role } });
        }

        return { id: user.id, name: user.name, role: user.role };
      }
    })
  ],
  pages: { signIn: '/' },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.name = token.name as string;
      }
      return session;
    }
  }
});
