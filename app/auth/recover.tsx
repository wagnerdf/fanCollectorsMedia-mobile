import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleRecover = async () => {
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu email!");
      return;
    }
    try {
      Alert.alert("Sucesso", "Link de redefinição enviado para seu email!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao enviar link:", error.message);
      }
      Alert.alert("Erro", "Não foi possível enviar o link de recuperação.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Senha</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.sendButton]} onPress={handleRecover}>
            <Text style={styles.buttonText}>Enviar link de redefinição</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/auth/login")} style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Lembrou sua senha? <Text style={styles.linkHighlight}>Voltar para login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c111c",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#141a26",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#1c2331",
    color: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2b3244",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#2563eb",
  },
  cancelButton: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: "#b0b0b0",
    textAlign: "center",
  },
  linkHighlight: {
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
});
