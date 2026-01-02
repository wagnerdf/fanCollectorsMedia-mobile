import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Platform, View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import Welcome from "app/auth/Welcome";
import { deactivateKeepAwake } from "expo-keep-awake";
import { setAuthToken, clearAuthToken } from "@/src/services/authToken";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function initApp() {
      if (Platform.OS === "web") return;

      deactivateKeepAwake();

      const token = await SecureStore.getItemAsync("userToken");
      const expirationString = await SecureStore.getItemAsync(
        "tokenExpiration"
      );

      if (token && expirationString) {
        const expiresAt = new Date(Number(expirationString)); // 🔑 AJUSTE CRÍTICO

        if (Date.now() < expiresAt.getTime()) {
          setAuthToken(token, expiresAt);
          router.replace("/(tabs)/explore");
          return;
        }
      }

      // ❌ token inválido ou expirado
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("tokenExpiration");
      clearAuthToken();
      router.replace("/auth/Welcome");
    }

    initApp();
  }, []);

  // WEB mantém comportamento atual
  if (Platform.OS === "web") {
    return <Welcome />;
  }

  // Mobile: loading temporário
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#00BFA6",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
