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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "hooks/useLogin";
import AnimatedError from "components/AnimatedError";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "@/src/services/authToken";
import { getTokenExpiration } from "@/src/utils/jwt";
import { setLoggedUser, getLoggedUser } from "@/src/services/userStorage";

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permanecerConectado, setPermanecerConectado] = useState(false);

  const { loading, errorMessage, loginUser, setErrorMessage } = useLogin();

  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (!login || !senha) {
      setErrorMessage("Preencha login e senha!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!emailRegex.test(login)) {
      setErrorMessage("Digite um email válido!");
      return;
    }

    try {
      const data = await loginUser(login, senha);

      if (!data?.token) {
        setErrorMessage("Erro ao autenticar.");
        return;
      }

      // 🔐 Extrai expiração do JWT
      const expiresAt = getTokenExpiration(data.token);

      if (!expiresAt) {
        console.error("Token sem data de expiração");
        setErrorMessage("Token inválido. Faça login novamente.");
        return;
      }

      // 🔑 SEMPRE injeta em memória
      setAuthToken(data.token, expiresAt);

      // 💾 Salva apenas se marcar permanecer conectado
      if (permanecerConectado) {
        await SecureStore.setItemAsync("userToken", data.token);
        await SecureStore.setItemAsync(
          "tokenExpiration",
          expiresAt.getTime().toString(),
        );
      }

      // 👤 Monta usuário logado
      const user = {
        email: login,
        username: login.split("@")[0], // simples e funcional
        loggedAt: new Date().toISOString(),
      };

      // 💾 Salva no storage
      await setLoggedUser(user);

      // 🔍 Lê e imprime no console
      const storedUser = await getLoggedUser();
      console.log("Usuário logado:", storedUser);

      router.replace("/(tabs)/explore");
    } catch (error) {
      console.error("Erro no login:", error);
      setErrorMessage("Erro interno, tente novamente.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Ionicons
          name="lock-closed-outline"
          size={52}
          color="#60a5fa"
          style={styles.icon}
        />

        <Text style={styles.title}>Login</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu email"
            placeholderTextColor="#999"
            value={login}
            onChangeText={setLogin}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Sua senha"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={senha}
              onChangeText={setSenha}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#60a5fa"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setPermanecerConectado(!permanecerConectado)}
        >
          <Ionicons
            name={permanecerConectado ? "checkbox" : "square-outline"}
            size={22}
            color="#60a5fa"
          />
          <Text style={styles.rememberText}>Permanecer conectado</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/recover")}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

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
            onPress={() => router.replace("/auth/Welcome")}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.signupText}>
          Ainda não tem conta?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => router.push("/auth/Register")}
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
  },
  forgotPasswordText: {
    color: "#60a5fa",
    textAlign: "right",
    marginBottom: 16,
    marginTop: 4,
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
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 12,
    ...(Platform.OS === "web"
      ? { textShadow: "1px 1px 4px rgba(0,0,0,0.4)" }
      : {
          textShadowColor: "rgba(0,0,0,0.4)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 4,
        }),
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  rememberText: {
    color: "#cbd5e1",
    marginLeft: 8,
    fontSize: 14,
  },
});
