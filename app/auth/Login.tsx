import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    
    if (!isValidEmail(email)) {
      alert("Email inválido!");
      return;
    }
    if (!email || !password) {
      alert("Preencha email e senha!");
      return;
    }

    try {
      // Futuramente conectar ao backend:
      router.replace("/(tabs)/home");
    } catch (error) {
      alert("Erro ao conectar. Verifique suas credenciais.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.toggleContainer}
        >
          <Text style={styles.togglePassword}>
            {showPassword ? "Ocultar senha" : "Mostrar senha"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("../auth/recover")}>
          <Text style={styles.recoverText}>Recuperar senha</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.signupText}>
          Ainda não tem conta?{" "}
          <Text
            style={styles.signupLink}
            onPress={() =>
              alert("Função de cadastro ainda não implementada!")
            }
          >
            Cadastre-se
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0d1117",
    padding: 24,
  },
  container: {
    backgroundColor: "#161b22",
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#0d1117",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  toggleContainer: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  togglePassword: {
    color: "#60a5fa",
    fontSize: 14,
  },
  recoverText: {
    color: "#60a5fa",
    textAlign: "right",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 16,
    flex: 1,
    alignItems: "center",
  },
  loginButton: { backgroundColor: "#2563eb", marginRight: 6 },
  backButton: { backgroundColor: "#dc2626", marginLeft: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  signupText: { color: "#cbd5e1", textAlign: "center" },
  signupLink: { color: "#60a5fa" },
});
