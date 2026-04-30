import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAppStore } from "@/store/useAppStore";
import type { PartnerRole } from "@/types";

const roles: { key: PartnerRole; title: string; subtitle: string }[] = [
  { key: "hotelOwner", title: "Hotel Partner", subtitle: "Add stays and manage hotel bookings" },
  { key: "driver", title: "Fleet Partner", subtitle: "Add vehicles and manage ride bookings" },
  { key: "propertyOwner", title: "Property Partner", subtitle: "Manage property leads and listings" },
];

export function RoleSelectionScreen() {
  const selectedRole = useAppStore((state) => state.selectedRole);
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);

  return (
    <Screen>
      <BrandHero
        eyebrow="Choose account type"
        title="Select your"
        accent="partner account."
        subtitle="Pick the option that matches your work. You can continue to login after this."
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
      <PrimaryButton title="Continue" onPress={() => setSelectedRole(selectedRole ?? "hotelOwner")} />
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
