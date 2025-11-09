"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface VIPStatus {
  isVip: boolean;
  expiresAt: string | null;
  loading: boolean;
}

export function useVIP() {
  const [user, setUser] = useState<User | null>(null);
  const [vipStatus, setVipStatus] = useState<VIPStatus>({
    isVip: false,
    expiresAt: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const checkVIP = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (!currentUser) {
          setUser(null);
          setVipStatus({ isVip: false, expiresAt: null, loading: false });
          return;
        }

        setUser(currentUser);

        // Get session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setVipStatus({ isVip: false, expiresAt: null, loading: false });
          return;
        }

        // Check VIP status via API
        const response = await fetch("/api/vip/status", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();
          setVipStatus({
            isVip: data.isVip || false,
            expiresAt: data.expiresAt || null,
            loading: false,
          });
        } else {
          setVipStatus({ isVip: false, expiresAt: null, loading: false });
        }
      } catch (error) {
        console.error("Error checking VIP status:", error);
        if (mounted) {
          setVipStatus({ isVip: false, expiresAt: null, loading: false });
        }
      }
    };

    checkVIP();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkVIP();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, ...vipStatus };
}

