import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import Welcome from "app/auth/Welcome"; // importa o componente que seria a primeira tela

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "web") {
      const timer = setTimeout(() => {
        router.replace("../auth/Welcome");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Renderização ---
  // Para web, mostra diretamente a tela Welcome
  // Para mobile, a tela será substituída pelo redirecionamento
  if (Platform.OS === "web") {
    return <Welcome />; // mostra conteúdo completo do app
  }

  return null; // mobile só usa redirecionamento
}
