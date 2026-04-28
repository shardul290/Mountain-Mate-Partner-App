import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { gradients } from "@/theme/tokens";
import { useAppStore } from "@/store/useAppStore";

export function Screen({ children }: PropsWithChildren) {
  const themeMode = useAppStore((state) => state.themeMode);
  const gradient = themeMode === "dark" ? gradients.darkHero : gradients.hero;

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 }}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
