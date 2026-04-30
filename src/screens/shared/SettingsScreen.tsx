import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ActionCard } from "@/components/ui/ActionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { signOutRemote } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

export function SettingsScreen() {
  const navigation = useNavigation<any>();
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
        eyebrow="Settings"
        title="Settings"
        accent="."
        subtitle="Change language, theme, and account settings here."
      />
      <View style={styles.card}>
        <Pressable onPress={() => setLanguage(language === "en" ? "hi" : "en")}>
          <Text style={styles.item}>Language: {language === "en" ? "English" : "Hindi"}</Text>
        </Pressable>
        <Pressable onPress={() => setThemeMode(themeMode === "light" ? "dark" : "light")}>
          <Text style={styles.item}>Theme: {themeMode}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.item}>Open profile</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("OperationsCenter")}>
          <Text style={styles.item}>Open verification and payouts</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Support")}>
          <Text style={styles.item}>Open support</Text>
        </Pressable>
        <PrimaryButton title="Sign out" onPress={logout} variant="ghost" />
      </View>
      <ActionCard
        title="Profile and verification"
        detail="Open your profile for account details. Open verification for ID proof, business proof, and bank details."
        status="Ready"
      />
      <ActionCard
        title="App connection"
        detail="This app is connected to your Mountain Mate backend and partner login system."
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
