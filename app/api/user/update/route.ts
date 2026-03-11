import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api/user/update");

const bodySchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be 100 characters or fewer")
    .regex(/^[^<>"';&]+$/, "Full name contains invalid characters"),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ authError }, "Unauthenticated update attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { full_name: string };
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch (err) {
    logger.warn({ err }, "Invalid request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ full_name: body.full_name })
    .eq("id", user.id);

  if (updateError) {
    logger.error({ err: updateError, userId: user.id }, "Failed to update user profile");
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  // Also sync into Supabase auth metadata so the name is consistent everywhere
  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: body.full_name },
  });

  if (metaError) {
    logger.warn({ err: metaError, userId: user.id }, "Failed to sync full_name to auth metadata");
    // Non-fatal — the DB row was already updated
  }

  logger.info({ userId: user.id }, "User profile updated");
  return NextResponse.json({ success: true });
}
