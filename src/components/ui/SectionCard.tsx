import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.20)",
    padding: 16,
  },
  glow: {
    position: "absolute",
    right: -16,
    top: -16,
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "rgba(249,115,22,0.10)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    lineHeight: 22,
  },
  body: {
    marginTop: 16,
  },
});
