import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        console.log('JWT callback - account received:', !!account)
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SignIn callback - user:', !!user, 'account:', !!account)
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
} 