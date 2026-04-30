import { StyleSheet, Text, View } from "react-native";

interface ListRowProps {
  title: string;
  meta: string;
  status?: string;
}

export function ListRow({ title, meta, status }: ListRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
      <Text style={styles.meta}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    marginRight: 12,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  status: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  meta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 19,
  },
});
