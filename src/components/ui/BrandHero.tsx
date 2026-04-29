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
    marginBottom: 18,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(5,10,9,0.30)",
    padding: 18,
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
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
  },
  accent: {
    color: "#FB923C",
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 21,
  },
  children: {
    marginTop: 16,
  },
});
