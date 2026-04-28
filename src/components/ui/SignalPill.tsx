import { StyleSheet, Text, View } from "react-native";

interface SignalPillProps {
  label: string;
}

export function SignalPill({ label }: SignalPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});
