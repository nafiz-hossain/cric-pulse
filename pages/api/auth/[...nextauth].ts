import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow specific email to add data
      return user.email === 'nhremon8181@gmail.com';
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});