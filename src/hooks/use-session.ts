"use client";

import { startTransition, useEffect, useState } from "react";

import {
  getSessionRequest,
  type AuthSessionRecord,
} from "@/lib/auth/client";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Session request failed";
}

export function useSession(initialSession?: AuthSessionRecord | null) {
  const [session, setSession] = useState<AuthSessionRecord | null>(
    initialSession ?? null,
  );
  const [isLoading, setIsLoading] = useState(initialSession === undefined);
  const [error, setError] = useState<string | null>(null);

  async function refreshSession() {
    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await getSessionRequest();

      startTransition(() => {
        setSession(nextSession);
      });

      return nextSession;
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "Authentication required") {
        startTransition(() => {
          setSession(null);
        });
        return null;
      }

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (initialSession !== undefined) {
      return;
    }

    let active = true;

    setIsLoading(true);
    setError(null);

    void getSessionRequest()
      .then((nextSession) => {
        if (!active) {
          return;
        }

        startTransition(() => {
          setSession(nextSession);
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        const message = getErrorMessage(error);

        if (message === "Authentication required") {
          setSession(null);
          return;
        }

        setError(message);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialSession]);

  return {
    session,
    isLoading,
    isAuthenticated: Boolean(session),
    error,
    refreshSession,
    setSession,
    clearSession: () => setSession(null),
  };
}
