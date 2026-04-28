import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ActionCardProps extends PropsWithChildren {
  title: string;
  detail: string;
  status?: string;
}

export function ActionCard({ title, detail, status, children }: ActionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
      <Text style={styles.detail}>{detail}</Text>
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  status: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  detail: {
    marginTop: 12,
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 22,
  },
  body: {
    marginTop: 16,
  },
});
