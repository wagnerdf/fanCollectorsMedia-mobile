import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Platform, View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import Welcome from "app/auth/Welcome";
import { deactivateKeepAwake } from "expo-keep-awake";
import { setAuthToken } from "@/src/services/authToken";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function initApp() {
      if (Platform.OS !== "web") {
        deactivateKeepAwake();

        const token = await SecureStore.getItemAsync("userToken");

        if (token) {
          setAuthToken(token); // 🔑 ESSENCIAL
          router.replace("/(tabs)/explore");
        } else {
          router.replace("/auth/Welcome");
        }
      }
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
