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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(8,13,12,0.42)",
    padding: 15,
  },
  label: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  value: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  hint: {
    marginTop: 6,
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
    lineHeight: 18,
  },
});
