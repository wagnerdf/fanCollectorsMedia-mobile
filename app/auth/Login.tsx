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

    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!emailRegex.test(login)) {
      setErrorMessage("Digite um email válido!");
      return;
    }

    const data = await loginUser(login, senha);

    if (data?.token) {
      try {
        await AsyncStorage.setItem("userToken", data.token);
        router.replace("/(tabs)/explore");
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
        {/* Ícone acima do título */}
        <Ionicons
          name="lock-closed-outline"
          size={52}
          color="#60a5fa"
          style={styles.icon}
        />
        <Text style={styles.title}>Login</Text>

        {/* Campo de Email */}
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

        {/* Campo de Senha */}
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
              onSubmitEditing={handleLogin}
              returnKeyType="send"
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

        {/* Link para recuperar senha */}
        <TouchableOpacity onPress={() => router.push("/auth/recover")}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
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
});
