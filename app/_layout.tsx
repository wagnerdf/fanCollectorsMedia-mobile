import React from "react";
import { StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { AppDataProvider } from "../src/context/AppDataContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // suporte total às áreas seguras

export default function Layout() {
  return (
    // Provider global da aplicação
    <AppDataProvider>
      {/* Provider responsável por aplicar áreas seguras no Android e iOS */}
      <SafeAreaProvider>
        {/* View que respeita as áreas seguras superior e inferior */}
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00BFA6", // Cor de fundo padrão
  },
});