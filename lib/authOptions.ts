import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { authenticateUser, getUserAndParentFromCommon, updateLastLogin } from "@/lib/auth"
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
        parent_org_id: { label: "Parent Organisation Id", type: "text" }
      },
      async authorize(credentials) {
        // ⚠️ REMOVE BEFORE DEPLOY — test credentials only
        if (credentials?.email === "test@test.com" && credentials?.password === "Amplify123!") {
          return { id: "1", email: "test@test.com", parent_org_id: "test-org" }
        }
        
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        let user = null;

        console.log("Credentials received in authorize:", credentials);

        if (credentials.parent_org_id !== "null") {
          user = await authenticateUser(
            credentials.email as string, 
            credentials.password as string, 
            credentials.parent_org_id as string
          )
        } else {
          user = await getUserAndParentFromCommon(
            credentials.email as string, 
            credentials.password as string
          )
          console.log("User found in common db:", user)
        }

        if (!user) {
          console.log("Invalid credentials")
          return null
        }

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET environment variable is not defined");
        }

        const accessToken = jwt.sign(
          { 
            email: user.email, 
            parent_org_id: credentials.parent_org_id !== "null" ? credentials.parent_org_id : user.parent_org_id, 
            role_id: user.role.id, 
            org_id: user.org_id, 
            user_id: user.id, 
            permissions: user.permissions 
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '5h' }
        )
        
        user.jwt = accessToken
        user.sessionExpires = Date.now() + 5 * 60 * 60 * 1000
        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        let userReal = user as User
        if (account?.provider === "credentials") {
          await updateLastLogin(userReal.jwt as string)
          return true
        }
        return false
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user as User
        console.log("JWT callback user:", user)
      }
      return token
    },
    async session({ session, token }) {
       if (token && session) {
        session.user = {
          ...token.user as User,
          emailVerified: null
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    newUser: '/auth/new-user'
  },
})