"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/constants/plans";
import { UsageIndicator } from "@/components/layout/UsageIndicator";
import { PageHeader } from "@/components/layout/PageHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  full_name: string | null;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  plans: {
    id: string;
    name: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PlanBadge({ planName }: { planName: string }) {
  const colours: Record<string, string> = {
    Free: "bg-[#F1F5F9] text-[#64748B]",
    Start: "bg-[#dbeafe] text-[#1B4F8A]",
    Pro: "bg-[#dcfce7] text-[#1A7A4A]",
    Enterprise: "bg-[#dbeafe] text-[#1B4F8A]",
  };
  const cls = colours[planName] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {planName}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
      <h2 className="mb-5 text-lg font-semibold text-[#1A1F2E]">{title}</h2>
      {children}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userRow, setUserRow] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Account section
  const [fullName, setFullName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security section
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Danger zone
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const [confirmText, setConfirmText] = useState("");

  // Portal loading
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // ── Load user ──────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("full_name, plan_id, stripe_customer_id, stripe_subscription_id, subscription_status, plans(id, name)")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setUserRow(data as UserRow);
      setFullName(data.full_name ?? "");
      setLoading(false);
    }

    load();
    // supabase client is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stripe portal ──────────────────────────────────────────────────────────

  async function openPortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setPortalError(json.error ?? "Failed to open billing portal.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setPortalError("Network error. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  // ── Save full name ─────────────────────────────────────────────────────────

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameMsg({ type: "error", text: "Full name cannot be empty." });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNameMsg({ type: "error", text: json.error ?? "Failed to save." });
      } else {
        setNameMsg({ type: "success", text: "Name updated successfully." });
        setUserRow((prev) => (prev ? { ...prev, full_name: trimmed } : prev));
      }
    } catch {
      setNameMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setNameSaving(false);
    }
  }

  // ── Change password ────────────────────────────────────────────────────────

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (newPw.length < 8) {
      setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPwSaving(true);
    try {
      // Reauthenticate by signing in again to verify current password
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setPwMsg({ type: "error", text: "Unable to verify identity. Please log in again." });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPw,
      });

      if (signInError) {
        setPwMsg({ type: "error", text: "Current password is incorrect." });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        setPwMsg({ type: "error", text: updateError.message ?? "Failed to update password." });
        return;
      }

      setPwMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      setPwMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPwSaving(false);
    }
  }

  // ── Deactivate account ────────────────────────────────────────────────────

  async function handleDeactivate() {
    if (confirmText !== "DEACTIVATE") return;
    setDeactivating(true);
    setDeactivateError(null);
    try {
      const supabaseServer = createClient();
      const {
        data: { user },
      } = await supabaseServer.auth.getUser();

      if (!user) {
        setDeactivateError("Session expired. Please log in again.");
        return;
      }

      const { error } = await supabaseServer
        .from("users")
        .update({ subscription_status: "canceled" })
        .eq("id", user.id);

      if (error) {
        setDeactivateError("Failed to deactivate account. Please contact support.");
        return;
      }

      await supabaseServer.auth.signOut();
      router.replace("/login?deactivated=1");
    } catch {
      setDeactivateError("Network error. Please try again.");
    } finally {
      setDeactivating(false);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const planName = userRow?.plans?.name ?? "Free";
  const hasBillingAccess = !!userRow?.stripe_customer_id;
  const isFreeOrCanceled =
    !userRow?.stripe_subscription_id ||
    userRow?.subscription_status === "canceled" ||
    planName === "Free";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="px-8 py-8 max-w-2xl">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[12px] bg-[#F1F5F9]" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="px-8 py-8 max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, billing, and security."
      />

      <UsageIndicator />

      {/* ── 1. Account ─────────────────────────────────────────────────── */}
      <SectionCard title="Account">
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-[#1A1F2E]">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              className="mt-1 block w-full rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#1A7A4A] focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
              placeholder="Your full name"
            />
          </div>

          {nameMsg && (
            <p
              className={`text-sm ${nameMsg.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {nameMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={nameSaving}
            className="rounded-[8px] bg-[#1A7A4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#155e3a] disabled:opacity-50"
          >
            {nameSaving ? "Saving…" : "Save Name"}
          </button>
        </form>

        <hr className="my-5 border-gray-100" />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[#64748B]">Current plan:</span>
          <PlanBadge planName={planName} />

          {hasBillingAccess && (
            <>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="ml-auto rounded-[8px] border border-[#1A7A4A] px-3 py-1.5 text-sm font-medium text-[#1A7A4A] hover:bg-[#f0fdf8] disabled:opacity-50"
              >
                {portalLoading ? "Opening…" : "Manage Subscription"}
              </button>

              {!isFreeOrCanceled && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="text-sm text-red-500 underline hover:text-red-700 disabled:opacity-50"
                >
                  Cancel Plan
                </button>
              )}
            </>
          )}
        </div>

        {portalError && <p className="mt-2 text-sm text-red-600">{portalError}</p>}
      </SectionCard>

      {/* ── 2. Payment ─────────────────────────────────────────────────── */}
      <SectionCard title="Payment">
        {hasBillingAccess ? (
          <div className="space-y-3">
            <p className="text-sm text-[#64748B]">
              Manage your payment method and billing details through the Stripe portal.
            </p>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="rounded-[8px] bg-[#1A1F2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d3748] disabled:opacity-50"
            >
              {portalLoading ? "Opening…" : "Update Payment Method"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-[#64748B]">
            No payment method on file.{" "}
            <a href="/pricing" className="text-[#1A7A4A] underline">
              Upgrade to a paid plan
            </a>{" "}
            to add one.
          </p>
        )}
      </SectionCard>

      {/* ── 3. Security ────────────────────────────────────────────────── */}
      <SectionCard title="Security">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current_pw" className="block text-sm font-medium text-[#1A1F2E]">
              Current Password
            </label>
            <input
              id="current_pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#1A7A4A] focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
            />
          </div>

          <div>
            <label htmlFor="new_pw" className="block text-sm font-medium text-[#1A1F2E]">
              New Password
            </label>
            <input
              id="new_pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#1A7A4A] focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
            />
          </div>

          <div>
            <label htmlFor="confirm_pw" className="block text-sm font-medium text-[#1A1F2E]">
              Confirm New Password
            </label>
            <input
              id="confirm_pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 block w-full rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#1A7A4A] focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
            />
          </div>

          {pwMsg && (
            <p
              className={`text-sm ${pwMsg.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {pwMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="rounded-[8px] bg-[#1A7A4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#155e3a] disabled:opacity-50"
          >
            {pwSaving ? "Updating…" : "Change Password"}
          </button>
        </form>
      </SectionCard>

      {/* ── 4. Danger Zone ─────────────────────────────────────────────── */}
      <SectionCard title="Danger Zone">
        <p className="mb-4 text-sm text-[#64748B]">
          Deactivating your account will cancel your subscription and permanently disable access.
          This action cannot be undone.
        </p>
        <button
          onClick={() => {
            setDeactivateOpen(true);
            setConfirmText("");
            setDeactivateError(null);
          }}
          className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-2 text-sm font-medium text-[#991B1B] hover:bg-[#fee2e2]"
        >
          Deactivate Account
        </button>
      </SectionCard>

      {/* ── Deactivate confirmation dialog ──────────────────────────────── */}
      {deactivateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 id="deactivate-title" className="text-lg font-semibold text-[#1A1F2E]">
              Deactivate Account
            </h3>
            <p className="mt-2 text-sm text-[#64748B]">
              This will immediately cancel your subscription and sign you out. All your data will be
              retained for 30 days before permanent deletion.
            </p>
            <p className="mt-4 text-sm font-medium text-[#1A1F2E]">
              Type <span className="font-mono font-bold text-red-600">DEACTIVATE</span> to confirm:
            </p>
            <input
              ref={confirmInputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1A7A4A] focus:outline-none focus:ring-2 focus:ring-[rgba(26,122,74,0.12)]"
              placeholder="DEACTIVATE"
            />
            {deactivateError && (
              <p className="mt-2 text-sm text-red-600">{deactivateError}</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeactivateOpen(false)}
                disabled={deactivating}
                className="rounded-[8px] px-4 py-2 text-sm font-medium text-[#1A1F2E] hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={confirmText !== "DEACTIVATE" || deactivating}
                className="rounded-[8px] bg-[#EF4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#dc2626] disabled:opacity-50"
              >
                {deactivating ? "Deactivating…" : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
