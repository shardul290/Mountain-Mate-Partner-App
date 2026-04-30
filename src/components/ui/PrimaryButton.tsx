import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: "solid" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ title, onPress, variant = "solid", disabled = false, loading = false }: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.button, variant === "solid" ? styles.solid : styles.ghost, disabled || loading ? styles.disabled : null]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.label}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  solid: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.20)",
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
});
