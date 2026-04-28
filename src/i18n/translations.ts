import type { AppLanguage } from "@/types";

const dictionary = {
  en: {
    onboardingTitle: "Grow your mountain business with clarity.",
    onboardingSubtitle: "Manage stays, rides, leads, and payouts from one focused partner workspace.",
    continue: "Continue",
    login: "Login",
    signup: "Create account",
    approvalPending: "Approval pending",
    approvalMessage: "Your KYC and partner profile are under review. We will unlock the full dashboard after approval.",
    notifications: "Notifications",
    support: "Support",
    settings: "Settings",
  },
  hi: {
    onboardingTitle: "Apne pahadi business ko smart tareeke se badhao.",
    onboardingSubtitle: "Stays, rides, leads aur payouts ko ek focused partner app se manage karo.",
    continue: "Aage badhein",
    login: "Login",
    signup: "Naya account",
    approvalPending: "Approval pending",
    approvalMessage: "Aapka KYC aur partner profile review mein hai. Approval ke baad full dashboard unlock ho jayega.",
    notifications: "Notifications",
    support: "Support",
    settings: "Settings",
  },
} as const;

export function t(language: AppLanguage, key: keyof typeof dictionary.en) {
  return dictionary[language][key];
}
