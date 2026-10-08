import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth-validation";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Pin explicitly so the server rule matches the client hint even if the
    // Better Auth default drifts in a future upgrade.
    minPasswordLength: PASSWORD_MIN_LENGTH,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false },
    },
  },
  plugins: [nextCookies()],
});
