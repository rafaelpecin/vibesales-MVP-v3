
-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enum for subscription status
CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'canceled',
    'trialing',
    'past_due'
);

-- Plans Table
CREATE TABLE public.plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    price_monthly numeric,
    stripe_price_id text,
    max_scans_per_day int NOT NULL DEFAULT 0,
    max_ads_per_day int NOT NULL DEFAULT 0,
    max_keywords_per_day int NOT NULL DEFAULT 0,
    enabled boolean NOT NULL DEFAULT TRUE,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.plans IS 'Defines the subscription plans for the application.';
COMMENT ON COLUMN public.plans.id IS 'Unique identifier for the plan.';
COMMENT ON COLUMN public.plans.name IS 'Name of the plan (e.g., Free, Start, Pro, Enterprise).';
COMMENT ON COLUMN public.plans.price_monthly IS 'Monthly price of the plan.';
COMMENT ON COLUMN public.plans.stripe_price_id IS 'Stripe Price ID associated with the plan.';
COMMENT ON COLUMN public.plans.max_scans_per_day IS 'Maximum number of URL scans allowed per day for this plan.';
COMMENT ON COLUMN public.plans.max_ads_per_day IS 'Maximum number of ad sets allowed per day for this plan.';
COMMENT ON COLUMN public.plans.max_keywords_per_day IS 'Maximum number of keywords allowed per day for this plan.';
COMMENT ON COLUMN public.plans.enabled IS 'Whether the plan is currently enabled and available.';
COMMENT ON COLUMN public.plans.created_at IS 'Timestamp when the plan was created.';
COMMENT ON COLUMN public.plans.updated_at IS 'Timestamp when the plan was last updated.';

-- Trigger for updating `updated_at` on `plans` table
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policies for plans table
CREATE POLICY "Allow authenticated access to plans" ON public.plans
FOR SELECT USING (TRUE);

-- Seed data for plans
INSERT INTO public.plans (name, price_monthly, stripe_price_id, max_scans_per_day, max_ads_per_day, max_keywords_per_day, enabled)
VALUES
('Free', 0, NULL, 1, 1, 5, TRUE),
('Start', 7, 'price_123_start', 10, 5, 20, TRUE),
('Pro', 14, 'price_123_pro', 50, 20, 100, TRUE),
('Enterprise', NULL, NULL, 0, 0, 0, FALSE);

-- Users Table (extends auth.users)
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    plan_id uuid REFERENCES public.plans(id) DEFAULT (SELECT id FROM public.plans WHERE name = 'Free'),
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status public.subscription_status,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.users IS 'User profiles extending Supabase Auth users.';
COMMENT ON COLUMN public.users.id IS 'Foreign key to auth.users.id.';
COMMENT ON COLUMN public.users.email IS 'User''s email address.';
COMMENT ON COLUMN public.users.full_name IS 'User''s full name.';
COMMENT ON COLUMN public.users.plan_id IS 'Foreign key to the plans table, indicating the user''s current subscription plan.';
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe Customer ID for payment processing.';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Stripe Subscription ID for recurring payments.';
COMMENT ON COLUMN public.users.subscription_status IS 'Current status of the user''s subscription.';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when the user profile was created.';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when the user profile was last updated.';

-- Trigger for updating `updated_at` on `users` table
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view and update their own data." ON public.users
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data." ON public.users
FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND (raw_user_meta_data->>'role')::text = 'admin'));

-- Index on plan_id for users table
CREATE INDEX users_plan_id_idx ON public.users (plan_id);

-- URL Scans Table
CREATE TABLE public.url_scans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    url text NOT NULL,
    current_score int,
    projected_score int,
    seo_result jsonb,
    created_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.url_scans IS 'Records of URL scans performed by users.';
COMMENT ON COLUMN public.url_scans.id IS 'Unique identifier for the URL scan.';
COMMENT ON COLUMN public.url_scans.user_id IS 'Foreign key to the users table.';
COMMENT ON COLUMN public.url_scans.url IS 'The URL that was scanned.';
COMMENT ON COLUMN public.url_scans.current_score IS 'Current SEO score of the URL.';
COMMENT ON COLUMN public.url_scans.projected_score IS 'Projected SEO score after applying recommendations.';
COMMENT ON COLUMN public.url_scans.seo_result IS 'Full Gemini API SEO response as JSONB.';
COMMENT ON COLUMN public.url_scans.created_at IS 'Timestamp when the scan was performed.';

-- Enable RLS for url_scans table
ALTER TABLE public.url_scans ENABLE ROW LEVEL SECURITY;

-- Policies for url_scans table
CREATE POLICY "Users can view and manage their own scans." ON public.url_scans
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all url scan data." ON public.url_scans
FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = user_id AND (raw_user_meta_data->>'role')::text = 'admin'));

-- Indexes for url_scans table
CREATE INDEX url_scans_user_id_idx ON public.url_scans (user_id);
CREATE INDEX url_scans_url_idx ON public.url_scans (url);

-- Enum for ad platform
CREATE TYPE public.ad_platform AS ENUM (
    'other',
    'google',
    'meta',
    'bing'
);

-- Ad Sets Table
CREATE TABLE public.ad_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scan_id uuid REFERENCES public.url_scans(id) ON DELETE SET NULL,
    url text NOT NULL,
    platform public.ad_platform NOT NULL,
    short_titles text[],
    long_titles text[],
    descriptions text[],
    keywords text[],
    created_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.ad_sets IS 'Generated advertisement sets for users.';
COMMENT ON COLUMN public.ad_sets.id IS 'Unique identifier for the ad set.';
COMMENT ON COLUMN public.ad_sets.user_id IS 'Foreign key to the users table.';
COMMENT ON COLUMN public.ad_sets.scan_id IS 'Optional foreign key to url_scans if the ad set was generated from a scan.';
COMMENT ON COLUMN public.ad_sets.url IS 'The target URL for the ad set.';
COMMENT ON COLUMN public.ad_sets.platform IS 'Advertising platform (e.g., Google, Meta, Bing).';
COMMENT ON COLUMN public.ad_sets.short_titles IS 'Array of short ad titles.';
COMMENT ON COLUMN public.ad_sets.long_titles IS 'Array of long ad titles.';
COMMENT ON COLUMN public.ad_sets.descriptions IS 'Array of ad descriptions.';
COMMENT ON COLUMN public.ad_sets.keywords IS 'Array of keywords for the ad set.';
COMMENT ON COLUMN public.ad_sets.created_at IS 'Timestamp when the ad set was created.';

-- Enable RLS for ad_sets table
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;

-- Policies for ad_sets table
CREATE POLICY "Users can view and manage their own ad sets." ON public.ad_sets
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ad set data." ON public.ad_sets
FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = user_id AND (raw_user_meta_data->>'role')::text = 'admin'));

-- Indexes for ad_sets table
CREATE INDEX ad_sets_user_id_idx ON public.ad_sets (user_id);
CREATE INDEX ad_sets_scan_id_idx ON public.ad_sets (scan_id);

-- Daily Usage Table
CREATE TABLE public.daily_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    usage_date date NOT NULL,
    scans_used int NOT NULL DEFAULT 0,
    ads_used int NOT NULL DEFAULT 0,
    keywords_used int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.daily_usage IS 'Records daily feature usage for each user.';
COMMENT ON COLUMN public.daily_usage.id IS 'Unique identifier for the daily usage record.';
COMMENT ON COLUMN public.daily_usage.user_id IS 'Foreign key to the users table.';
COMMENT ON COLUMN public.daily_usage.usage_date IS 'The date for which usage is recorded.';
COMMENT ON COLUMN public.daily_usage.scans_used IS 'Number of scans used on this date.';
COMMENT ON COLUMN public.daily_usage.ads_used IS 'Number of ads generated on this date.';
COMMENT ON COLUMN public.daily_usage.keywords_used IS 'Number of keywords generated on this date.';
COMMENT ON COLUMN public.daily_usage.created_at IS 'Timestamp when the usage record was created.';

-- Enable RLS for daily_usage table
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Policies for daily_usage table
CREATE POLICY "Users can view and manage their own daily usage." ON public.daily_usage
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily usage data." ON public.daily_usage
FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = user_id AND (raw_user_meta_data->>'role')::text = 'admin'));

-- Indexes for daily_usage table
CREATE INDEX daily_usage_user_id_idx ON public.daily_usage (user_id);
CREATE UNIQUE INDEX daily_usage_user_id_usage_date_idx ON public.daily_usage (user_id, usage_date);

-- Password Reset Tokens Table
CREATE TABLE public.password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT FALSE NOT NULL,
    created_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.password_reset_tokens IS 'Stores tokens for password reset functionality.';
COMMENT ON COLUMN public.password_reset_tokens.id IS 'Unique identifier for the password reset token.';
COMMENT ON COLUMN public.password_reset_tokens.user_id IS 'Foreign key to the users table.';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'The unique token sent to the user for password reset.';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'Timestamp when the token expires.';
COMMENT ON COLUMN public.password_reset_tokens.used IS 'Indicates if the token has been used.';
COMMENT ON COLUMN public.password_reset_tokens.created_at IS 'Timestamp when the token was created.';

-- Enable RLS for password_reset_tokens table
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for password_reset_tokens table
CREATE POLICY "Users can manage their own password reset tokens." ON public.password_reset_tokens
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all password reset tokens." ON public.password_reset_tokens
FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = user_id AND (raw_user_meta_data->>'role')::text = 'admin'));

-- Indexes for password_reset_tokens table
CREATE INDEX password_reset_tokens_user_id_idx ON public.password_reset_tokens (user_id);
CREATE INDEX password_reset_tokens_token_idx ON public.password_reset_tokens (token);
