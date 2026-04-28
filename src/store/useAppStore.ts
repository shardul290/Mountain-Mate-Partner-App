import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AppLanguage, AuthUser, PartnerRole, ThemeMode } from "@/types";

interface AppState {
  bootstrapped: boolean;
  onboardingSeen: boolean;
  selectedRole: PartnerRole | null;
  themeMode: ThemeMode;
  language: AppLanguage;
  authUser: AuthUser | null;
  liveAvailable: boolean;
  setBootstrapped: (value: boolean) => void;
  setOnboardingSeen: (value: boolean) => void;
  setSelectedRole: (role: PartnerRole | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setAuthUser: (user: AuthUser | null) => void;
  setLiveAvailable: (value: boolean) => void;
  signOutLocal: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      bootstrapped: false,
      onboardingSeen: false,
      selectedRole: null,
      themeMode: "light",
      language: "en",
      authUser: null,
      liveAvailable: true,
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),
      setOnboardingSeen: (onboardingSeen) => set({ onboardingSeen }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setAuthUser: (authUser) => set({ authUser }),
      setLiveAvailable: (liveAvailable) => set({ liveAvailable }),
      signOutLocal: () =>
        set({
          authUser: null,
          selectedRole: null,
          liveAvailable: true,
        }),
    }),
    {
      name: "mm-partner-app",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingSeen: state.onboardingSeen,
        selectedRole: state.selectedRole,
        themeMode: state.themeMode,
        language: state.language,
        liveAvailable: state.liveAvailable,
      }),
    }
  )
);
