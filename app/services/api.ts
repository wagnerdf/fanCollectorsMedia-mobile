import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export const apiPost = async (endpoint: string, body: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
};

export async function getTotalMidias(): Promise<number> {
  try {
    const token = await AsyncStorage.getItem("userToken"); // pega o token salvo
    if (!token) return 0;

    const response = await fetch(`${API_BASE_URL}/api/midias/usuario/total`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar total de mídias");

    const data = await response.json();
    return data.totalMidias;
  } catch (error) {
    console.error("API getTotalMidias error:", error);
    return 0;
  }
}
