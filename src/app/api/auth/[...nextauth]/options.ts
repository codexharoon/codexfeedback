import dbConnection from "@/app/lib/dbConnection";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import USER from "@/app/models/User";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "username or email",
          type: "text",
          placeholder: "jarvis@codexfeedback.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        await dbConnection();
        try {
          const { identifier, password }: any = credentials;

          const user = await USER.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          });

          if (user) {
            if (!user.isVerify) {
              throw new Error("Please verify your email first");
            }

            const verifiedPass = await bcryptjs.compare(
              password,
              user.password
            );
            if (verifiedPass) {
              return user;
            }
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },
};
