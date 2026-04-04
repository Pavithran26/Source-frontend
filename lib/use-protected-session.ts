"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSessionUser, type LoginResponse } from "./api";
import { clearStoredSession, getStoredSession, isSessionExpired } from "./session";

type ProtectedSessionState = {
  loading: boolean;
  session: LoginResponse | null;
};

export function useProtectedSession(): ProtectedSessionState {
  const router = useRouter();
  const [state, setState] = useState<ProtectedSessionState>({
    loading: true,
    session: null
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const storedSession = getStoredSession();

      if (!storedSession || isSessionExpired(storedSession)) {
        clearStoredSession();

        if (active) {
          setState({ loading: false, session: null });
          startTransition(() => router.replace("/"));
        }

        return;
      }

      try {
        await getSessionUser(storedSession.token);

        if (active) {
          setState({ loading: false, session: storedSession });
        }
      } catch {
        clearStoredSession();

        if (active) {
          setState({ loading: false, session: null });
          startTransition(() => router.replace("/"));
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [router]);

  return state;
}
