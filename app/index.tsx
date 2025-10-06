import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Usar setTimeout para garantir que o layout está montado
    const timer = setTimeout(() => {
      router.replace("../auth/Welcome");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return null; // não precisa renderizar nada
}

