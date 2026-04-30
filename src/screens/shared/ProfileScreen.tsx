import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ActionCard } from "@/components/ui/ActionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAppStore } from "@/store/useAppStore";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.authUser);

  return (
    <Screen>
      <BrandHero
        eyebrow="Profile"
        title="Partner"
        accent="details."
        subtitle="See your account details and open verification when you are ready."
      />
      <SectionCard title="Account details" subtitle="Basic account details linked to your partner login.">
        <View style={styles.stack}>
          <Text style={styles.item}>Name: {user?.fullName || "Not set"}</Text>
          <Text style={styles.item}>Email: {user?.email || "Not set"}</Text>
          <Text style={styles.item}>Phone: {user?.phone || "Not set"}</Text>
          <Text style={styles.item}>Role: {user?.partnerRole || "Not set"}</Text>
          <Text style={styles.item}>Verification status: {user?.approvalStatus || "pending"}</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton title="Open verification" onPress={() => navigation.navigate("OperationsCenter")} />
        </View>
        <View style={styles.actions}>
          <PrimaryButton title="Open support" onPress={() => navigation.navigate("Support")} variant="ghost" />
        </View>
      </SectionCard>
      <ActionCard
        title="Complete KYC in steps"
        detail="You can finish ID proof, business proof, and bank details step by step."
        status="Simple"
      />
      <ActionCard
        title="Backend link"
        detail="This partner app is connected to your existing backend and Supabase auth project. Hotel, transport, inventory, notifications, and incoming booking flows are reusing the same server APIs."
        status="Connected"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  actions: {
    marginTop: 18,
  },
  item: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },
});
