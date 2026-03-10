"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("hooks/useAuth");

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface UseAuthReturn extends AuthState {
  /** Signs the user out and redirects to /login. */
  signOut: () => Promise<void>;
}

/**
 * Provides reactive access to the current Supabase auth session.
 * Subscribes to `onAuthStateChange` so UI re-renders on login / logout.
 *
 * @returns Current user, session, loading flag, and a `signOut` helper.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Hydrate from existing session on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => subscription.unsubscribe();
    // supabase client is stable — no need to list as dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    logger.info({ userId: state.user?.id }, "User signing out");
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router, state.user?.id]);

  return { ...state, signOut };
}
