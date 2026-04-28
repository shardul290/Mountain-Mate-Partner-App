import { useEffect } from "react";

import { supabase } from "@/services/supabase";
import { registerForPushNotifications } from "@/services/notifications/push";
import { toAuthUser } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

export function useBootstrapApp() {
  const setAuthUser = useAppStore((state) => state.setAuthUser);
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);
  const setBootstrapped = useAppStore((state) => state.setBootstrapped);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const bootstrap = async () => {
      try {
        if (!supabase) {
          await registerForPushNotifications().catch(() => null);
          if (active) {
            setBootstrapped(true);
          }
          return;
        }

        const [{ data }] = await Promise.all([supabase.auth.getSession(), registerForPushNotifications()]);
        if (!active) return;

        if (data.session?.user) {
          const user = toAuthUser(data.session.user);
          setAuthUser(user);
          setSelectedRole(user.partnerRole);
        }
      } catch (error) {
        console.warn("Bootstrap failed", error);
      } finally {
        if (active) {
          setBootstrapped(true);
        }
      }
    };

    bootstrap();

    if (supabase) {
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        const user = session?.user ? toAuthUser(session.user) : null;
        setAuthUser(user);
        setSelectedRole(user?.partnerRole ?? null);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setAuthUser, setBootstrapped, setSelectedRole]);
}
