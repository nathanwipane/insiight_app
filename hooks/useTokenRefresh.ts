"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/constants/types";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;   // check every 5 minutes
const REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // refresh if < 1h remaining

export function useTokenRefresh() {
  const { data: session, update } = useSession();
  const isRefreshing = useRef(false);

  useEffect(() => {
    const check = async () => {
      if (isRefreshing.current) return;

      const user = session?.user as User | undefined;
      const token = user?.jwt;
      if (!token) return;

      // Decode expiry from JWT payload (middle segment)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000; // convert to ms
        const remaining = expiresAt - Date.now();

        if (remaining > REFRESH_THRESHOLD_MS) return; // plenty of time left

        // Less than 1h remaining — refresh silently
        isRefreshing.current = true;
        console.log("[useTokenRefresh] Token expiring soon, refreshing...");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/refresh-token`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (data?.status && data?.data?.access_token) {
          await update({ jwt: data.data.access_token });
          console.log("[useTokenRefresh] Token refreshed successfully");
        } else {
          console.warn("[useTokenRefresh] Refresh failed, user will be redirected on expiry", data);
        }
      } catch (err) {
        console.warn("[useTokenRefresh] Error during token refresh:", err);
      } finally {
        isRefreshing.current = false;
      }
    };

    // Run immediately on mount, then every 5 minutes
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);

  }, [session, update]);
}
