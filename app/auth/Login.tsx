import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface LoginResponse {
  token: string | null;
  message?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Função para animar a mensagem de erro
  const showError = (message: string) => {
    setErrorMessage(message);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(login)) {
      showError("Digite um email válido!");
      return;
    }

    if (!login || !senha) {
      showError("Preencha login e senha!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/fanCollectorsMedia/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, senha }),
        }
      );

      let data: LoginResponse = { token: null };
      try {
        data = await response.json();
      } catch (_) {
        data = { token: null };
      }

      if (response.ok) {
        router.replace("/(tabs)/home");
      } else {
        showError(data.message || "Login ou senha incorretos!");
      }

    } catch (error) {
      showError("Erro ao conectar com o servidor!");
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
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

        {/* Mensagem de erro animada */}
        {errorMessage ? (
          <Animated.Text style={[styles.errorText, { opacity: fadeAnim }]}>
            {errorMessage}
          </Animated.Text>
        ) : null}

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? "Ocultar" : "Mostrar"} senha
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              // Remove foco
              (document.activeElement as HTMLElement)?.blur();
              router.replace("/auth/Welcome");
            }}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.signupText}>
          Ainda não tem conta?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => showError("Função de cadastro ainda não implementada!")}
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
  errorText: {
    color: "#f87171",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});
