import { AuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { parsedEnv } from "./env";
import axios from "axios";
import { loginUser } from "./services/auth.services";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await loginUser(credentials.email, credentials.password);

          if (response.success) {
            return {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              accessToken: response.data.token,
            };
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          console.log("Error", error);
          throw new Error(error.message);
        }
      },
    }),
    GoogleProvider({
      clientId: parsedEnv.GOOGLE_CLIENT_ID,
      clientSecret: parsedEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: parsedEnv.NEXT_PUBLIC_SECRET,
  callbacks: {
    async signIn({ account, profile, user }) {
      // Ensure the Google login is successful
      if (account?.provider === "google") {
        // @ts-ignore
        return profile?.email_verified; // Allow sign-in if email is verified
      }
      return true;
    },
    async jwt({ token, account, user, profile }) {
      // Check if this is a new Google login session
      if (account?.provider === "google") {
        try {
          // Call your backend API to exchange Google tokens for an access token
          const response = await axios.post(
            `${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/google`,
            {
              name: profile?.name,
              email: profile?.email,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const _response = response.data;

          if (!_response.success) {
            console.error("Failed to fetch access token from backend:", _response);
          } else {
            console.log("response", _response.data.user.name);
            // Save the access token to the JWT
            token.accessToken = _response.data.token;
            token.name = _response.data.user.name;
            token.user_id = _response.data.user.id;
          }
        } catch (error) {
          console.error("Error fetching backend access token:", error);
        }
      }
      if (account?.provider === "credentials") {
        token.user_id = user.id;
        token.name = user.name;

        // @ts-ignore
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token, user }) {
      // @ts-ignore
      session.user.accessToken = token.accessToken;
      // @ts-ignore
      session.user.id = token.user_id;
      // @ts-ignore
      session.user.name = token.name;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Your custom sign-in page
  },
};

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * @returns The session object or null
 */
const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
