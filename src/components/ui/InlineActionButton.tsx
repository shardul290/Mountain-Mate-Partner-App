import { Pressable, StyleSheet, Text } from "react-native";

interface InlineActionButtonProps {
  title: string;
  onPress: () => void;
  tone?: "primary" | "danger" | "neutral";
  disabled?: boolean;
}

export function InlineActionButton({
  title,
  onPress,
  tone = "neutral",
  disabled = false,
}: InlineActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        tone === "primary" ? styles.primary : tone === "danger" ? styles.danger : styles.neutral,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === "primary" ? styles.primaryText : tone === "danger" ? styles.dangerText : styles.neutralText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primary: {
    borderColor: "rgba(249,115,22,0.30)",
    backgroundColor: "rgba(249,115,22,0.16)",
  },
  danger: {
    borderColor: "rgba(239,68,68,0.30)",
    backgroundColor: "rgba(239,68,68,0.16)",
  },
  neutral: {
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  primaryText: {
    color: "#FED7AA",
  },
  dangerText: {
    color: "#FECACA",
  },
  neutralText: {
    color: "rgba(255,255,255,0.82)",
  },
});
