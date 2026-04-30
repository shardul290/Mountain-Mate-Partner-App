import { StyleSheet, Text, TextInput, type KeyboardTypeOptions, View } from "react-native";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline = false,
  keyboardType,
  autoCapitalize = "sentences",
  error,
  helperText,
  required = false,
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.45)"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline ? styles.multiline : null, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
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
  required: {
    color: "#FB7185",
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
  inputError: {
    borderColor: "#FB7185",
  },
  multiline: {
    minHeight: 112,
    paddingTop: 16,
  },
  helper: {
    marginTop: 8,
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    marginTop: 8,
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 18,
  },
});
