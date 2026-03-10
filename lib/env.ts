import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // Google Gemini
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with 'sk_'"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with 'whsec_'"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with 'pk_'"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // Optional: Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Parses and validates all required environment variables against the schema.
 * Throws a descriptive error at startup if any variable is missing or invalid.
 */
function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment variable validation failed:\n${formatted}`);
  }

  return parsed.data;
}

export const env = createEnv();

export type Env = z.infer<typeof envSchema>;
