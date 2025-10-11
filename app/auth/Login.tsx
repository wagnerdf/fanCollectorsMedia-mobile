import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLogin } from "hooks/useLogin";
import AnimatedError from "components/AnimatedError";

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loading, errorMessage, loginUser, setErrorMessage } = useLogin();

  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (!login || !senha) {
      setErrorMessage("Preencha login e senha!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(login)) {
      setErrorMessage("Digite um email válido!");
      return;
    }

    const data = await loginUser(login, senha);

    if (data?.token) {
      try {
        // Salva o token JWT no AsyncStorage
        await AsyncStorage.setItem("userToken", data.token);
        router.replace("/(tabs)/home");
      } catch (e) {
        console.error("Erro ao salvar token:", e);
        setErrorMessage("Erro interno, tente novamente.");
      }
    } else if (!errorMessage) {
      setErrorMessage(data?.message || "Login ou senha incorretos!");
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
          value={login}
          onChangeText={setLogin}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? "Ocultar" : "Mostrar"} senha
          </Text>
        </TouchableOpacity>

        {/* Mensagem de erro animada */}
        <AnimatedError message={errorMessage} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
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
            onPress={() => setErrorMessage("Função de cadastro ainda não implementada!")}
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
    marginBottom: 16,
  },
  togglePassword: {
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
