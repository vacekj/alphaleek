import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {params: {scope: 'repo'}},

    }),
  ],
  callbacks: {
    signIn: ({account}) => {
      return true;
    },
    jwt: async ({token, user, account}) => {
      let newToken = token;
      if (account) {
        newToken = {
          account,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token
        }
      }

      return newToken;
    },
    session: async ({session, token}) => {
      session.token = token;
      return Promise.resolve(session);
    },
  }
})
