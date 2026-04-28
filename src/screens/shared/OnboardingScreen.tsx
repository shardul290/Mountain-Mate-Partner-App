import { StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SignalPill } from "@/components/ui/SignalPill";
import { t } from "@/i18n/translations";
import { useAppStore } from "@/store/useAppStore";

export function OnboardingScreen() {
  const language = useAppStore((state) => state.language);
  const setOnboardingSeen = useAppStore((state) => state.setOnboardingSeen);

  return (
    <Screen>
      <View style={styles.container}>
        <BrandHero
          eyebrow="Built for Uttarakhand partners"
          title="Grow the hills"
          accent="without the chaos."
          subtitle={t(language, "onboardingSubtitle")}
        >
          <View style={styles.pills}>
            <SignalPill label="Verified stays and rides" />
            <SignalPill label="One partner workflow" />
            <SignalPill label="Admin-backed approval" />
          </View>
        </BrandHero>
        <Text style={styles.copy}>{t(language, "onboardingTitle")}</Text>
        <View style={styles.actions}>
          <PrimaryButton title={t(language, "continue")} onPress={() => setOnboardingSeen(true)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 32,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  copy: {
    marginTop: 8,
    color: "rgba(255,255,255,0.84)",
    fontSize: 16,
    lineHeight: 26,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
