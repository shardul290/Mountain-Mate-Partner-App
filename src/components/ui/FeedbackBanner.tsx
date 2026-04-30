import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface FeedbackBannerProps {
  tone?: "success" | "error" | "info";
  message: string;
}

const toneMap = {
  success: {
    bg: "rgba(34,197,94,0.14)",
    border: "rgba(34,197,94,0.30)",
    color: "#DCFCE7",
    icon: "check-circle",
  },
  error: {
    bg: "rgba(239,68,68,0.14)",
    border: "rgba(239,68,68,0.30)",
    color: "#FEE2E2",
    icon: "alert-circle",
  },
  info: {
    bg: "rgba(249,115,22,0.14)",
    border: "rgba(249,115,22,0.30)",
    color: "#FFEDD5",
    icon: "info",
  },
} as const;

export function FeedbackBanner({ tone = "info", message }: FeedbackBannerProps) {
  const palette = toneMap[tone];

  return (
    <View style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Feather name={palette.icon} size={18} color={palette.color} />
      <Text style={[styles.message, { color: palette.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
