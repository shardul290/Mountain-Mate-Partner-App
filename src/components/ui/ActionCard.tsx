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
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
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
    fontSize: 17,
    fontWeight: "800",
  },
  status: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  detail: {
    marginTop: 10,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 20,
  },
  body: {
    marginTop: 14,
  },
});
