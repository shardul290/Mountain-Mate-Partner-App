import { supabase } from "@/services/supabase";
import type { AuthUser, PartnerRole } from "@/types";

const partnerRoleMap: Record<string, PartnerRole> = {
  hotelOwner: "hotelOwner",
  driver: "driver",
  propertyOwner: "propertyOwner",
};

export const toAuthUser = (user: any): AuthUser => ({
  id: user.id,
  email: user.email ?? "",
  fullName: user.user_metadata?.full_name ?? user.user_metadata?.display_name ?? "",
  phone: user.user_metadata?.phone ?? "",
  partnerRole: partnerRoleMap[user.app_metadata?.role || user.user_metadata?.partner_role] ?? "hotelOwner",
  approvalStatus: user.app_metadata?.approval_status || user.user_metadata?.approval_status || "pending",
  avatarUrl: user.user_metadata?.avatar_url ?? "",
});

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured for this app. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function signInWithPassword(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
}

export async function signUpPartner(payload: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  partnerRole: PartnerRole;
}) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
        display_name: payload.fullName,
        phone: payload.phone,
        partner_role: payload.partnerRole,
        approval_status: "pending",
      },
    },
  });

  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
}

export async function sendPhoneOtp(phone: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
}

export async function requestPasswordReset(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOutRemote() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
