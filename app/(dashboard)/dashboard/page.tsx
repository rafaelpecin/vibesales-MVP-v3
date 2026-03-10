import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UrlInputForm } from "@/components/seo/UrlInputForm";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-gray-500">
          Enter a URL below to analyse its SEO health with AI.
        </p>
      </div>

      <UrlInputForm />
    </main>
  );
}
