import { StyleSheet, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n/translations";
import { useAppStore } from "@/store/useAppStore";

export function ApprovalPendingScreen({ navigation }: any) {
  const language = useAppStore((state) => state.language);

  return (
    <Screen>
      <View style={styles.container}>
        <BrandHero
          eyebrow="Verification"
          title={t(language, "approvalPending")}
          subtitle={t(language, "approvalMessage")}
        />
        <View style={styles.actions}>
          <PrimaryButton title="Open verification" onPress={() => navigation.navigate("OperationsCenter")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
