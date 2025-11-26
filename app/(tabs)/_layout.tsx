import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#121212" }}
        edges={["bottom"]}
      >
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
          {/* Explorer */}
          <Tabs.Screen
            name="explore"
            options={{
              title: "Menu",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="apps" color={color} size={size} />
              ),
            }}
          />

          {/* Gerenciador de Mídias */}
          <Tabs.Screen
            name="midiaBase"
            options={{
              title: "Mídias",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="videocam" color={color} size={size} />
              ),
            }}
          />

          {/* home */}
          <Tabs.Screen
            name="home" // corresponde a app/(tabs)/home/
            options={{
              title: "Biblioteca",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library" color={color} size={size} />
              ),
            }}
          />

          {/* Usuário */}
          <Tabs.Screen
            name="userEdit"
            options={{
              title: "Usuário",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
