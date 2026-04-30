import { StyleSheet, Text, View } from "react-native";

interface FormStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export function FormStepHeader({ currentStep, totalSteps, title, subtitle }: FormStepHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.badge}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.progress}>{Math.round((currentStep / totalSteps) * 100)}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    color: "#FDBA74",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  progress: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#F97316",
  },
  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 20,
  },
});
