import { StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ActionCard } from "@/components/ui/ActionCard";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAppStore } from "@/store/useAppStore";

export function ProfileScreen() {
  const user = useAppStore((state) => state.authUser);

  return (
    <Screen>
      <BrandHero
        eyebrow="Identity and trust"
        title="Partner"
        accent="profile."
        subtitle="Your partner identity rides on the same auth stack and approval pipeline as the existing Mountain Mate platform."
      />
      <SectionCard title="Account snapshot" subtitle="Supabase-backed session identity">
        <View style={styles.stack}>
          <Text style={styles.item}>Name: {user?.fullName || "Not set"}</Text>
          <Text style={styles.item}>Email: {user?.email || "Not set"}</Text>
          <Text style={styles.item}>Phone: {user?.phone || "Not set"}</Text>
          <Text style={styles.item}>Role: {user?.partnerRole || "Not set"}</Text>
          <Text style={styles.item}>Verification status: {user?.approvalStatus || "pending"}</Text>
        </View>
      </SectionCard>
      <ActionCard
        title="Complete KYC later"
        detail="Verification is no longer blocking login. Partners can enter the dashboard first, then complete KYC, banking, and business verification progressively from profile and settings."
        status="Optional first"
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
  item: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },
});
