import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

// 🔧 Pega a URL da API definida em app.config.js (ou no EAS Secret)
const { API_BASE_URL } = Constants.expoConfig?.extra || {};

// ✅ Fallback para evitar crash caso API_BASE_URL não esteja definida
const baseURL =
  API_BASE_URL && API_BASE_URL !== "undefined"
    ? API_BASE_URL
    : "https://fancollectorsmedia-production.up.railway.app"; // fallback definitivo de produção


console.log("🌐 API_BASE_URL:", baseURL);

// 🧩 Cria uma instância do axios com base na URL da API
const api = axios.create({
  baseURL,
});

// 🛡️ Intercepta todas as requisições e injeta o token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Content-Type"] = "application/json";
  return config;
});

// 🚀 Função genérica para requisições POST (usando axios)
export const apiPost = async (endpoint: string, body: any) => {
  try {
    const response = await api.post(endpoint, body);
    return response.data;
  } catch (error: any) {
    console.error("Erro na requisição POST:", error.response?.data || error.message);
    throw error;
  }
};

// 🎞️ Retorna o total de mídias do usuário
export const getTotalMidias = async (): Promise<number> => {
  try {
    const response = await api.get("/api/midias/usuario/total");
    return response.data.totalMidias;
  } catch (error: any) {
    console.error("Erro ao buscar total de mídias:", error.response?.data || error.message);
    return 0;
  }
};

// 📀 Retorna a lista de mídias do usuário (paginação 10 em 10)
export const getUserMidias = async (offset: number = 0, limit: number = 10) => {
  try {
    const response = await api.get(`/api/midias/minhas`, {
      params: { offset, limit },
    });
    return response.data; // { total, midias, hasMore }
  } catch (error: any) {
    console.error("Erro ao buscar mídias do usuário:", error.response?.data || error.message);
    return { total: 0, midias: [], hasMore: false };
  }
};

// 🔎 Busca uma mídia específica pelo ID
export const getMidiaById = async (id: number) => {
  const response = await api.get(`/api/midias/${id}`);
  return response.data;
};

export default api;
