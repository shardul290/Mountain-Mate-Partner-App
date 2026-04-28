import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

import { env } from "@/config/env";

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const isSupabaseConfigured = env.hasSupabaseConfig;

export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: secureStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
