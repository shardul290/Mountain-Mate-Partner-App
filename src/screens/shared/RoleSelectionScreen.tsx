import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAppStore } from "@/store/useAppStore";
import type { PartnerRole } from "@/types";

const roles: { key: PartnerRole; title: string; subtitle: string }[] = [
  { key: "hotelOwner", title: "Hotel Owner", subtitle: "Bookings, occupancy, inventory, payouts" },
  { key: "driver", title: "Taxi Driver", subtitle: "Ride requests, availability, documents, earnings" },
  { key: "propertyOwner", title: "Property Owner", subtitle: "Homestays, land leads, inquiries, analytics" },
];

export function RoleSelectionScreen() {
  const selectedRole = useAppStore((state) => state.selectedRole);
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);

  return (
    <Screen>
      <BrandHero
        eyebrow="Choose your operating mode"
        title="Built for operators"
        accent="not travelers."
        subtitle="The app uses the same Mountain Mate backend, but the workflow is tuned for owners, drivers, and local growth partners."
      />
      <View style={styles.list}>
        {roles.map((role) => {
          const active = selectedRole === role.key;
          return (
            <Pressable
              key={role.key}
              onPress={() => setSelectedRole(role.key)}
              style={[styles.roleCard, active ? styles.roleCardActive : styles.roleCardIdle]}
            >
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton title="Continue to partner login" onPress={() => setSelectedRole(selectedRole ?? "hotelOwner")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 24,
    marginBottom: 8,
  },
  roleCard: {
    marginBottom: 16,
    borderRadius: 30,
    borderWidth: 1,
    padding: 20,
  },
  roleCardActive: {
    borderColor: "#7DD3FC",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  roleCardIdle: {
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  roleTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  roleSubtitle: {
    marginTop: 12,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 22,
  },
});
