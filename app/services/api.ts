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

// 📊 Retorna todos os gêneros do usuário com contagem de mídias
export const getGeneros = async (): Promise<{ genero: string; total: number }[]> => {
  try {
    const response = await api.get("/api/midias/generos");
    return response.data; // agora data é um array de DTOs: [{ genero, total }]
  } catch (error: any) {
    console.error("Erro ao buscar gêneros:", error.response?.data || error.message);
    return [];
  }
};

// 📊 Retorna todos os tipos de mídia do usuário com contagem
export const getTipos = async (): Promise<{ tipo: string; total: number }[]> => {
  try {
    const response = await api.get("/api/midias/tipos");
    return response.data; // array de DTOs: [{ tipo, total }]
  } catch (error: any) {
    console.error("Erro ao buscar tipos de mídia:", error.response?.data || error.message);
    return [];
  }
};

// 🔎 Busca mídias do usuário por gênero (com paginação)
export const getMidiasByGenero = async (
  genero: string,
  page: number = 0,
  size: number = 10
): Promise<{ content: any[]; currentPage: number; totalItems: number; totalPages: number; hasMore: boolean }> => {
  try {
    const response = await api.get(`/api/midias/generos/${encodeURIComponent(genero)}`, {
      params: { page, size },
    });

    return response.data; // objeto { content, currentPage, totalItems, totalPages, hasMore }
  } catch (error: any) {
    console.error("Erro ao buscar mídias por gênero:", error.response?.data || error.message);
    return { content: [], currentPage: 0, totalItems: 0, totalPages: 0, hasMore: false };
  }
};

// 🔎 Busca mídias do usuário por tipo (com paginação)
export const getMidiasByTipo = async (
  tipo: string,
  page: number = 0,
  size: number = 10
): Promise<{ content: any[]; currentPage: number; totalItems: number; totalPages: number; hasMore: boolean }> => {
  try {
    const response = await api.get(`/api/midias/tipo-midia/${encodeURIComponent(tipo)}`, {
      params: { page, size },
    });

    return response.data; // objeto { content, currentPage, totalItems, totalPages, hasMore }
  } catch (error: any) {
    console.error("Erro ao buscar mídias por tipo:", error.response?.data || error.message);
    return { content: [], currentPage: 0, totalItems: 0, totalPages: 0, hasMore: false };
  }
};

// 👤 Retorna os dados do perfil do usuário logado
export const getUserProfile = async (): Promise<{
  id: number;
  nome: string;
  sobreNome: string;
  email: string;
  avatarUrl: string;
}> => {
  try {
    const response = await api.get("/api/cadastros/perfil");
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar perfil do usuário:", error.response?.data || error.message);
    throw error;
  }
};

// 💾 Atualiza os dados do perfil do usuário (flexível para qualquer campo)
export const updateUserProfile = async (body: Record<string, any>) => {
  try {
    const response = await api.put("/api/cadastros/perfilEditar", body);
    return response.data; // retorna os dados atualizados
  } catch (error: any) {
    //console.error("Erro ao atualizar perfil:", error.response?.data || error.message);
    throw error;
  }
};

// 🔐 Envia solicitação para recuperação de senha
export const recuperarSenha = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post("/auth/recuperar-senha", { email });
    
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erro ao enviar recuperação de senha:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🧾 Cadastro completo de novo usuário (com endereço)
export const cadastrarUsuarioCompleto = async (userData: {
  nome: string;
  sobreNome: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  senha: string;
  avatarUrl: string;
  status?: string;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}) => {
  try {
    const response = await api.post("/auth/registerFull", userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erro ao cadastrar usuário:", error.response?.data || error.message);
    throw error;
  }
};



export default api;
