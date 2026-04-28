import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ActionCard } from "@/components/ui/ActionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { signOutRemote } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

export function SettingsScreen() {
  const language = useAppStore((state) => state.language);
  const themeMode = useAppStore((state) => state.themeMode);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const signOutLocal = useAppStore((state) => state.signOutLocal);

  const logout = async () => {
    await signOutRemote();
    signOutLocal();
  };

  return (
    <Screen>
      <BrandHero
        eyebrow="Control room"
        title="Settings"
        accent="and system."
        subtitle="Theme, language, session, and backend connectivity are managed here."
      />
      <View style={styles.card}>
        <Pressable onPress={() => setLanguage(language === "en" ? "hi" : "en")}>
          <Text style={styles.item}>Language: {language === "en" ? "English" : "Hindi"}</Text>
        </Pressable>
        <Pressable onPress={() => setThemeMode(themeMode === "light" ? "dark" : "light")}>
          <Text style={styles.item}>Theme: {themeMode}</Text>
        </Pressable>
        <PrimaryButton title="Sign out" onPress={logout} variant="ghost" />
      </View>
      <ActionCard
        title="Verification placement"
        detail="KYC, business documents, and approval signals should live here or inside profile as progressive completion steps, not as early signup blockers."
        status="Updated"
      />
      <ActionCard
        title="Backend connection"
        detail="API calls are pointed at your existing Mountain Mate backend through EXPO_PUBLIC_API_URL, and partner sessions use the same Supabase project as the website."
        status="Live"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    marginBottom: 16,
    gap: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.20)",
    padding: 20,
  },
  item: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },
});
