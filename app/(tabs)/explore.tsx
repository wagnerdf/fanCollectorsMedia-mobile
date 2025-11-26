import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppModal from "@/components/AppModal";

export default function ExplorerScreen() {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );

  const showModal = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.title}>Explorar</Text>

        <Text style={styles.subtitle}>
          Descubra novas mídias, coleções e tendências compartilhadas pela
          comunidade FanCollectorsMedia.
        </Text>

        <View style={styles.section}>
          {/* 🔥 GERENCIAR MÍDIAS */}
          <View style={styles.item}>
            <Text style={styles.itemTitle}>📀 Gerenciar Mídias</Text>
            <Text style={styles.itemText}>
              Cadastre, edite e organize sua coleção de filmes e séries.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.blueButton]}
              onPress={() => router.push("/(tabs)/midiaBase")}
            >
              <Text style={styles.actionText}>Gerenciar Mídias</Text>
            </TouchableOpacity>
          </View>

          {/* 📚 MINHA BIBLIOTECA */}
          <View style={styles.item}>
            <Text style={styles.itemTitle}>📚 Minha Biblioteca</Text>
            <Text style={styles.itemText}>
              Veja todas as mídias que você já cadastrou na sua coleção.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.orangeButton]}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text style={styles.actionText}>Abrir Biblioteca</Text>
            </TouchableOpacity>
          </View>

          {/* Mantendo o restante igual */}
          <View style={styles.item}>
            <Text style={styles.itemTitle}>⭐ Fãs em Destaque</Text>
            <Text style={styles.itemText}>
              Conheça os colecionadores mais ativos e suas incríveis coleções.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.greenButton]}
              onPress={() =>
                showModal("Funcionalidade em desenvolvimento!", "info")
              }
            >
              <Text style={styles.actionText}>Explorar fãs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemTitle}>🎮 Mídias Populares</Text>
            <Text style={styles.itemText}>
              Confira os jogos, filmes e séries mais colecionados do momento.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.purpleButton]}
              onPress={() =>
                showModal("Funcionalidade em desenvolvimento!", "info")
              }
            >
              <Text style={styles.actionText}>Ver mídias</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.redButton, { marginTop: 18 }]}
          onPress={() => router.replace("/auth/Login")}
        >
          <Text style={styles.actionText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <AppModal
        visible={modalVisible}
        message={modalMessage}
        modalType={modalType}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#0d1117",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 12,
  },
  section: {
    marginTop: 8,
  },
  item: {
    backgroundColor: "#0d1117",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2b2f33",
    marginBottom: 12,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  itemText: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
  blueButton: {
    backgroundColor: "#2563eb",
  },
  greenButton: {
    backgroundColor: "#16a34a",
  },
  purpleButton: {
    backgroundColor: "#7c3aed",
  },
  redButton: {
    backgroundColor: "#dc2626",
  },
  orangeButton: {
  backgroundColor: "#ea580c",
},
});
