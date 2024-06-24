import NextAuth, { CredentialsSignin } from "next-auth";
import { authConfig } from "./auth.config";
import credentials from "next-auth/providers/credentials";
import { userLoginSchema } from "./lib/schemas";
import axios from "axios";

class CustomError extends CredentialsSignin {
  code = "ptm";
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
    credentials({
      authorize: async (credentials) => {
        const parsedCredentials = userLoginSchema.safeParse(credentials);
        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;

          const apiURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
          const response = await axios.post(
            apiURL + "/login",
            {
              handle: username,
              password,
            },
            {
              validateStatus(status) {
                return status < 500;
              },
            }
          );

          if (response.status !== 200) {
            return null;
          }

          return response.data;
        }
        return null;
      },
    }),
  ],
});
