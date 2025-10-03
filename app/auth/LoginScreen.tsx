import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = () => {
    if (!email || !password) {
      alert("Preencha email e senha!");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Email inválido!");
      return;
    }

    // 🚀 Agora navega para a Home nas Tabs
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Tela de Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? "Ocultar" : "Mostrar"} senha
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    padding: 20,
    ...(Platform.OS === "web" ? { maxWidth: 400, marginHorizontal: "auto" } : {}),
  },
  container: { width: "100%" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  togglePassword: { color: "#007bff", marginBottom: 20, textAlign: "right" },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
