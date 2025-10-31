import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserEdit() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <Text style={styles.subtitle}>Aqui o usuário poderá atualizar seus dados.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5a623",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
  },
});
