const required = (value: string | undefined, key: string) => {
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
  }

  return value ?? "";
};

const hasSupabaseConfig =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const env = {
  apiUrl: required(process.env.EXPO_PUBLIC_API_URL, "EXPO_PUBLIC_API_URL").replace(/\/$/, ""),
  supabaseUrl: required(process.env.EXPO_PUBLIC_SUPABASE_URL, "EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: required(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, "EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  hasSupabaseConfig,
};
