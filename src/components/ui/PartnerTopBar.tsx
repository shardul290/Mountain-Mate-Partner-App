import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { signOutRemote } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

const roleLabels = {
  hotelOwner: "Hotel Partner",
  driver: "Ride Partner",
  propertyOwner: "Property Partner",
} as const;

export function PartnerTopBar() {
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.authUser);
  const signOutLocal = useAppStore((state) => state.signOutLocal);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const goTo = (screen: "Inbox" | "Settings" | "Profile") => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  const signOut = async () => {
    setMenuOpen(false);
    try {
      await signOutRemote();
    } finally {
      signOutLocal();
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.brandChip}>
          <MaterialCommunityIcons name="image-filter-hdr" size={18} color="#FDBA74" />
          <View>
            <Text style={styles.brandTitle}>Mountain Mate</Text>
            <Text style={styles.brandMeta}>{roleLabels[user.partnerRole]}</Text>
          </View>
        </View>

        <Pressable onPress={() => setMenuOpen((current) => !current)} style={styles.avatarButton}>
          <Text style={styles.avatarText}>{initials || "MM"}</Text>
          <Feather name={menuOpen ? "chevron-up" : "chevron-down"} size={14} color="#D7E3DD" />
        </Pressable>
      </View>

      {menuOpen ? (
        <View style={styles.menu}>
          <Pressable onPress={() => goTo("Inbox")} style={styles.menuItem}>
            <Feather name="message-square" size={16} color="#F8FAFC" />
            <Text style={styles.menuText}>Inbox</Text>
          </Pressable>
          <Pressable onPress={() => goTo("Profile")} style={styles.menuItem}>
            <Feather name="user" size={16} color="#F8FAFC" />
            <Text style={styles.menuText}>Profile</Text>
          </Pressable>
          <Pressable onPress={() => goTo("Settings")} style={styles.menuItem}>
            <Feather name="settings" size={16} color="#F8FAFC" />
            <Text style={styles.menuText}>Settings</Text>
          </Pressable>
          <Pressable onPress={signOut} style={[styles.menuItem, styles.signOutItem]}>
            <Feather name="log-out" size={16} color="#FED7AA" />
            <Text style={[styles.menuText, styles.signOutText]}>Sign out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(7,16,13,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  brandMeta: {
    marginTop: 2,
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "600",
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avatarText: {
    minWidth: 34,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#F97316",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
  },
  menu: {
    marginTop: 10,
    marginLeft: "auto",
    width: 190,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(8,15,13,0.96)",
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  menuText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  signOutItem: {
    marginTop: 4,
    backgroundColor: "rgba(249,115,22,0.10)",
  },
  signOutText: {
    color: "#FED7AA",
  },
});
