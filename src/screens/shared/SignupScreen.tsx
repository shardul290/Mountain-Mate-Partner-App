import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { signUpPartner } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

export function SignupScreen() {
  const selectedRole = useAppStore((state) => state.selectedRole) ?? "hotelOwner";
  const setAuthUser = useAppStore((state) => state.setAuthUser);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      const user = await signUpPartner({
        fullName,
        phone,
        email: email.trim(),
        password,
        partnerRole: selectedRole,
      });
      if (user) {
        setAuthUser(user);
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <Screen>
      <BrandHero
        eyebrow="Apply as partner"
        title="Fast onboarding"
        accent="strict approval."
        subtitle="This account goes into your existing Mountain Mate auth stack, then awaits admin approval before full access."
      />
      <View style={styles.formCard}>
        <Text style={styles.selectedRole}>Selected role: {selectedRole}</Text>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your legal/business name" />
        <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="+91..." />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Submit partner application" onPress={handleSignup} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    marginTop: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 20,
  },
  selectedRole: {
    marginBottom: 16,
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
  },
  error: {
    marginBottom: 12,
    color: "#FECACA",
    fontSize: 14,
  },
});
