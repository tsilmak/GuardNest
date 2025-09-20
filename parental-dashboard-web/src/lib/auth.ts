"server-only";

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const auth = betterAuth({
  database: new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  socialProviders: {
    // github: {
    // clientId: process.env.GITHUB_CLIENT_ID as string,
    // clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  secret: process.env.BETTER_AUTH_SECRET,

  plugins: [jwt()],
});
