import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function UserEdit() {
  const [screen, setScreen] = useState<"main" | "editData" | "editAddress" | "changePassword">("main");

  const handleBack = () => setScreen("main");

  return (
    <View style={styles.container}>
      {screen === "main" && (
        <>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=3" }} // imagem temporária
            style={styles.avatar}
          />
          <Text style={styles.name}>Wagner Andrade</Text>

          <TouchableOpacity style={styles.option} onPress={() => setScreen("editData")}>
            <Text style={styles.optionText}>Editar Dados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setScreen("editAddress")}>
            <Text style={styles.optionText}>Editar Endereço</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setScreen("changePassword")}>
            <Text style={styles.optionText}>Alterar Senha</Text>
          </TouchableOpacity>
        </>
      )}

      {screen === "editData" && (
        <View style={styles.subScreen}>
          <Text style={styles.subTitle}>📝 Editar Dados</Text>
          <Text style={styles.subText}>Aqui virá o formulário de atualização dos dados do usuário.</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "editAddress" && (
        <View style={styles.subScreen}>
          <Text style={styles.subTitle}>🏠 Editar Endereço</Text>
          <Text style={styles.subText}>Formulário para editar o endereço do usuário.</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "changePassword" && (
        <View style={styles.subScreen}>
          <Text style={styles.subTitle}>🔒 Alterar Senha</Text>
          <Text style={styles.subText}>Tela para troca de senha do usuário.</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
  },
  option: {
    backgroundColor: "#1e1e1e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  optionText: {
    color: "#f5a623",
    fontSize: 16,
    fontWeight: "500",
  },
  subScreen: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  subTitle: {
    color: "#f5a623",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#f5a623",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
});