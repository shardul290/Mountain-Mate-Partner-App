import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function EmptyState({ title, message, icon = "inbox" }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={20} color="#FDBA74" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  iconWrap: {
    marginBottom: 12,
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(249,115,22,0.14)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  message: {
    marginTop: 8,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
