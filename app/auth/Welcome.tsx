import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/fans.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Bem-vindo ao FanCollectorsMedia</Text>

      <Text style={styles.subtitle}>
        Conecte-se com fãs como você, compartilhe sua coleção e descubra novas mídias para amar.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.buttonText}>Logar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => alert("Função de cadastro ainda não implementada!")}
        >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  image: { width: 180, height: 180, marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 36,
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  loginButton: { backgroundColor: "#2563eb", flex: 1, marginRight: 6, alignItems: "center" },
  signupButton: { backgroundColor: "#16a34a", flex: 1, marginLeft: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
