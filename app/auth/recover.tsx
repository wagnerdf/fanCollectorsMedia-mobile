import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppModal from "@/components/AppModal";
import { recuperarSenha } from "@/src/services/api";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">("info");

  const handleRecover = async () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      setModalMessage("Digite seu email!");
      setModalType("info");
      setModalVisible(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModalMessage("Digite um email válido!");
      setModalType("info");
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const response = await recuperarSenha(email);
      const backendMessage =
        response?.message || (typeof response === "string" ? response : "");

      setModalMessage(backendMessage);
      setModalType("success");
      setModalVisible(true);
      setEmail("");
    } catch (error: any) {
      let backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      if (typeof backendMessage === "object") {
        backendMessage =
          backendMessage.message ||
          backendMessage.error ||
          JSON.stringify(backendMessage);
      }

      backendMessage = String(backendMessage)
        .replace(/^\s*\d{3}\s+\w+_?\w*\s*/i, "")
        .replace(/^"|"$/g, "")
        .trim();

      setModalMessage(backendMessage);
      setModalType("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.push("auth/Login");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Ícone de redefinição de senha */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <MaterialCommunityIcons name="lock-reset" size={60} color="#2563eb" />
        </View>

        <Text style={styles.title}>Recuperar Senha</Text>

        <Text style={styles.subtitle}>
          Digite seu email abaixo e enviaremos um link para redefinir sua senha.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, styles.recoverButton]}
          onPress={handleRecover}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <AppModal
        visible={modalVisible}
        message={modalMessage}
        modalType={modalType}
        onClose={handleModalClose}
      />
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 20,
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
  button: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  recoverButton: { backgroundColor: "#2563eb" },
  backButton: { backgroundColor: "#dc2626" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
