import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // garante área segura no Android/iOS

export default function TabsLayout() {
  return (
    // Provider para respeitar as áreas seguras
    <SafeAreaProvider>
      {/* Área segura para evitar sobreposição com barras do sistema */}
      <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }} edges={["bottom"]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#121212",
              borderTopColor: "#222",
              height: 60,
              paddingBottom: 5,
            },
            tabBarActiveTintColor: "#f5a623",
            tabBarInactiveTintColor: "#888",
            tabBarLabelStyle: { fontSize: 12 },
          }}
        >
          <Tabs.Screen
            name="explore"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="home"
            options={{
              title: "Biblioteca",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          {/* 👇 Oculta a tela Library do menu, mas mantém rota acessível */}
          <Tabs.Screen
            name="library"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
