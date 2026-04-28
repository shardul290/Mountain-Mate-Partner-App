import { StyleSheet, Text, TextInput, View } from "react-native";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export function TextField({ label, value, onChangeText, placeholder, secureTextEntry }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.45)"
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  input: {
    minHeight: 56,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.20)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
