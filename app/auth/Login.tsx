import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !senha) {
      alert("Preencha login e senha!");
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(login)) {
      alert("Login deve ser um email válido!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/fanCollectorsMedia/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // Aqui você pode salvar o token em AsyncStorage ou SecureStore
        console.log("Login bem-sucedido:", data.accessToken);
        router.replace("/(tabs)/home");
      } else {
        alert(data.message || "Login ou senha incorretos!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor!");
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
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.signupText}>
          Ainda não tem conta?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => alert("Função de cadastro ainda não implementada!")}
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
