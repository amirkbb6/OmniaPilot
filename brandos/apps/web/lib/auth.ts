import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./db";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        console.info("Magic link for", identifier, url);
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
};
