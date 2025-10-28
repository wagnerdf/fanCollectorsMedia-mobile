import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { AppDataProvider } from "../src/context/AppDataContext";

export default function Layout() {
  return (
    <AppDataProvider>
      <SafeAreaView style={styles.container}>
        <Slot />
      </SafeAreaView>
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00BFA6",
  },
});


