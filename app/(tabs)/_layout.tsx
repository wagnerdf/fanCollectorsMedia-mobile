import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppDataProvider } from "../../src/context/AppDataContext";

export default function TabsLayout() {
  return (
    <AppDataProvider>
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
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
          }}
        />
      </Tabs>
    </AppDataProvider>
  );
}
