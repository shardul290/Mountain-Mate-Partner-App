import type { PropsWithChildren } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { PartnerTopBar } from "@/components/ui/PartnerTopBar";
import { gradients } from "@/theme/tokens";
import { useAppStore } from "@/store/useAppStore";

interface ScreenProps extends PropsWithChildren {
  showHeader?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Screen({ children, showHeader = true, onRefresh, refreshing = false }: ScreenProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const authUser = useAppStore((state) => state.authUser);
  const gradient = themeMode === "dark" ? gradients.darkHero : gradients.hero;

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FDBA74" /> : undefined}
        >
          <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 14 }}>
            {authUser && showHeader ? <PartnerTopBar /> : null}
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
