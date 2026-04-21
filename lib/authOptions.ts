import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { getUserAndParentFromCommon, updateLastLogin } from "@/lib/auth"
import { User } from "@/constants/types"
import jwt from 'jsonwebtoken'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        let user = null;

        console.log("Credentials received in authorize:", credentials);

        user = await getUserAndParentFromCommon(
          credentials.email as string,
          credentials.password as string
        )

        if (!user) {
          console.log("Invalid credentials")
          return null
        }

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET environment variable is not defined");
        }

        console.log("User before JWT sign:", JSON.stringify(user, null, 2));

        const accessToken = jwt.sign(
          {
            email: user.email,
            parent_org_id: user.parent_org_id,
            role_id: user.role.id,
            org_id: user.org_id,
            user_id: user.id,
            org_name: (user as any).org_name ?? "",
            permissions: user.permissions,
            org_type: user.org_type
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '8h' }
        )

        user.jwt = accessToken
        user.sessionExpires = Date.now() + 8 * 60 * 60 * 1000
        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        let userReal = user as User
        if (account?.provider === "credentials") {
          // Fire and forget — don't block sign-in on this call
          updateLastLogin(userReal.jwt as string).catch(err =>
            console.error('updateLastLogin failed silently:', err)
          );
          return true
        }
        return false
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = {
          ...(user as any),
          org_name: (user as any).org_name ?? "",
        }
        console.log("JWT callback user:", user)
      }
      // Handle session update triggered by update() in OrgSwitcher
      if (trigger === "update" && session?.jwt) {
        // Decode the new JWT and update the token.user with new org context
        try {
          const decoded = jwt.verify(
            session.jwt,
            process.env.JWT_SECRET as string
          ) as User;
          token.user = {
            ...(token.user as User),
            jwt: session.jwt,
            parent_org_id: decoded.parent_org_id,
            org_id: decoded.org_id,
            org_name: decoded.org_name,
            permissions: decoded.permissions,
          };
          (token.user as any).sessionExpires = Date.now() + 8 * 60 * 60 * 1000;
        } catch (err) {
          console.error("JWT update decode failed:", err);
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session) {
        const tokenUser = token.user as any;
        session.user = {
          ...tokenUser,
          emailVerified: null,
          org_name: tokenUser.org_name ?? "",
        } as any;
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
})