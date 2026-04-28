import axios from "axios";

import { env } from "@/config/env";
import { supabase } from "@/services/supabase";

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (!supabase) {
    return config;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
