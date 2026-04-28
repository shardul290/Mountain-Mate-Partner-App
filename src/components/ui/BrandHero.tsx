import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

interface BrandHeroProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle: string;
}

export function BrandHero({ eyebrow, title, accent, subtitle, children }: BrandHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>
        {title}
        {accent ? <Text style={styles.accent}> {accent}</Text> : null}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.28)",
    padding: 20,
  },
  glow: {
    position: "absolute",
    right: -24,
    top: -24,
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: "rgba(249,115,22,0.18)",
  },
  eyebrow: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 4,
  },
  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  accent: {
    color: "#FB923C",
  },
  subtitle: {
    marginTop: 16,
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 24,
  },
  children: {
    marginTop: 20,
  },
});
