import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { signInWithPassword } from "@/services/api/auth";
import { useAppStore } from "@/store/useAppStore";

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuthUser = useAppStore((state) => state.setAuthUser);
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);

  const handleLogin = async () => {
    try {
      setError("");
      const user = await signInWithPassword(email.trim(), password);
      if (user) {
        setAuthUser(user);
        setSelectedRole(user.partnerRole);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <BrandHero
          eyebrow="Partner login"
          title="Login to your"
          accent="partner account."
          subtitle="Check bookings, add listings, and manage your work from one app."
        />
        <View style={styles.formCard}>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="partner@mountainmate.in" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Login" onPress={handleLogin} />
          <Pressable onPress={() => navigation.navigate("Signup")} style={styles.linkWrap}>
            <Text style={styles.link}>New user? Create an account</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 32,
  },
  formCard: {
    marginTop: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 20,
  },
  error: {
    marginBottom: 12,
    color: "#FECACA",
    fontSize: 14,
  },
  linkWrap: {
    marginTop: 16,
  },
  link: {
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
  },
});
