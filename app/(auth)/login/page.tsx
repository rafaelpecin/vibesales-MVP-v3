"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { createLogger } from "@/lib/logger";
import { clientEnv as env } from "@/lib/env";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const logger = createLogger("auth/login");

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  const supabase = createClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    logger.info({ email: values.email }, "Login attempt");

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      logger.error({ email: values.email, error: error.message }, "Login failed");
      setServerError(error.message);
      return;
    }

    logger.info({ email: values.email }, "Login successful");
    router.push(redirectTo);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setOauthLoading(provider);
    setServerError(null);
    logger.info({ provider }, "OAuth login initiated");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      logger.error({ provider, error: error.message }, "OAuth login failed");
      setServerError(error.message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf8] via-white to-[#eff6ff] min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#2ECC7A]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#3B82F6]/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-8 py-10">
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-2xl font-bold text-[#1A1F2E]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">Sign in to your Vibe Sales account</p>
          </div>

          {/* Google OAuth */}

            {oauthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="/google-signin.svg"
                alt="Continue with Google"
                onClick={() => handleOAuth("google")}
                width={179}
                height={40}
                />
            )}
          

          {/* Facebook — temporarily disabled pending app approval */}
          {/* <button
            type="button"
            disabled={!!oauthLoading || isSubmitting}
            onClick={() => handleOAuth("facebook")}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-[8px] border border-[#E2E8F0] bg-white text-[#1A1F2E] text-sm font-medium hover:bg-[#F8FAFC] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {oauthLoading === "facebook" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            Continue with Facebook
          </button> */}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#64748B] tracking-wide">Or continue with email</span>
            </div>
          </div>

          {/* Email/password form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#1A1F2E]">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-[#1A1F2E]">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-[#1A7A4A] hover:underline underline-offset-4">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p role="alert" className="text-sm font-medium text-[#EF4444]">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-[8px] bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#155e3a] hover:-translate-y-px transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#1A7A4A] hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
