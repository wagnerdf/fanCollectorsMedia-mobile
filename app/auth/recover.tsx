import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleRecover = () => {
    if (!email) {
      alert("Digite seu email!");
      return;
    }
    alert("Link de recuperação enviado!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar senha</Text>

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
            <Text style={styles.buttonText}>Enviar link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginRight: 6,
  },
  backButton: {
    backgroundColor: "#d9534f",
    marginLeft: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
