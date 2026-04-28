import { StyleSheet, Text, View } from "react-native";

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
  },
  label: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  value: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
  },
  hint: {
    marginTop: 8,
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 22,
  },
});
