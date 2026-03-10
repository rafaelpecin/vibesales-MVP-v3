// ─── Auth & Users ────────────────────────────────────────────────────────────

/** Role assigned to an application user. */
export type UserRole = "user" | "admin" | "superadmin";

/** Subscription status mirroring Stripe subscription statuses. */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

/**
 * Application-level user profile stored in the `profiles` table.
 * Extends Supabase Auth user data with app-specific fields.
 */
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  planId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Plans ───────────────────────────────────────────────────────────────────

/** Feature limits enforced per billing period for a plan. */
export interface PlanLimits {
  scansPerMonth: number;
  adSets: number;
  exportEnabled: boolean;
  prioritySupport: boolean;
  customPrompts: boolean;
}

/**
 * A subscription plan available in the application.
 */
export interface Plan {
  id: string;
  name: string;
  description: string;
  /** Monthly price in USD. null = contact sales (enterprise). */
  priceMonthly: number | null;
  /** Stripe Price ID used to create checkout sessions. null for free/enterprise. */
  stripePriceId: string | null;
  features: string[];
  limits: PlanLimits;
  isComingSoon: boolean;
  /** Whether this plan should be visually highlighted on the pricing page. */
  highlighted: boolean;
}

// ─── Scans ───────────────────────────────────────────────────────────────────

/** Status of an AI-powered scan job. */
export type ScanStatus = "pending" | "processing" | "completed" | "failed";

/**
 * A single piece of AI-generated feedback within a scan result.
 */
export interface ScanInsight {
  category: string;
  score: number;
  summary: string;
  recommendations: string[];
}

/**
 * The structured output returned by the Gemini API after analysing an ad or content.
 */
export interface ScanResult {
  id: string;
  userId: string;
  adSetId: string | null;
  status: ScanStatus;
  inputUrl: string | null;
  inputText: string | null;
  overallScore: number | null;
  insights: ScanInsight[];
  rawResponse: string | null;
  tokensUsed: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

// ─── Ads ─────────────────────────────────────────────────────────────────────

/** Supported advertising platforms. */
export type AdPlatform = "facebook" | "google" | "instagram" | "tiktok" | "linkedin" | "other";

/** Status of an ad set. */
export type AdSetStatus = "draft" | "active" | "paused" | "archived";

/**
 * A collection of ads grouped for analysis and optimisation.
 */
export interface AdSet {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  platform: AdPlatform;
  status: AdSetStatus;
  targetUrl: string | null;
  budget: number | null;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string | null;
  tags: string[];
  latestScanId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * An individual ad creative belonging to an AdSet.
 */
export interface Ad {
  id: string;
  adSetId: string;
  userId: string;
  headline: string | null;
  bodyText: string | null;
  imageUrl: string | null;
  callToAction: string | null;
  destinationUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Usage & Billing ─────────────────────────────────────────────────────────

/**
 * A single usage record logged per AI scan call.
 */
export interface UsageRecord {
  id: string;
  userId: string;
  scanId: string;
  planId: string;
  tokensUsed: number;
  costUsd: number | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt: string;
}

/**
 * Aggregated usage summary for a user within the current billing period.
 */
export interface UsageSummary {
  userId: string;
  planId: string;
  scansUsed: number;
  scansLimit: number;
  adSetsUsed: number;
  adSetsLimit: number;
  periodStart: string;
  periodEnd: string;
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

/**
 * Payload stored after a successful Stripe checkout session.
 */
export interface StripeCheckoutSession {
  sessionId: string;
  customerId: string;
  subscriptionId: string;
  planId: string;
  userId: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

/**
 * Standard envelope for all API route responses.
 *
 * @template T - The shape of the data payload on success.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata returned by list endpoints.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated list response envelope.
 *
 * @template T - The type of items in the list.
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * Summary row displayed in the admin user table.
 */
export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  planId: string;
  subscriptionStatus: SubscriptionStatus | null;
  scansTotal: number;
  createdAt: string;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

/**
 * Props accepted by the MetaTags SEO component.
 */
export interface MetaTagsProps {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * A single item in the application navigation.
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  requiresRole?: UserRole;
}
