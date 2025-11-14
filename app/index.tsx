import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import Welcome from "app/auth/Welcome";
import { deactivateKeepAwake } from "expo-keep-awake";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Desativa apenas no mobile (onde o KeepAwake funciona de verdade)
    if (Platform.OS !== "web") {
      deactivateKeepAwake();

      const timer = setTimeout(() => {
        router.replace("../auth/Welcome");
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  // --- Renderização ---
  if (Platform.OS === "web") {
    return <Welcome />;
  }

  return null;
}
