import api from "./api";

export async function searchMovies(query: string) {
  return [];
}

export async function searchTvShows(query: string) {
  return [];
}

export async function getMovieDetails(id: number) {
  return {
    id,
    title: "",
    overview: "",
  };
}

export async function getTvDetails(id: number) {
  return {
    id,
    name: "",
    overview: "",
  };
}

/**
 * Novo método de busca no TMDB
 * Usando o endpoint do backend que criamos:
 * GET /api/tmdb/buscar/{query}
 */
export async function buscarTituloTMDB(query: string) {
  try {
    if (!query || query.length < 2) return [];

    const response = await api.get(`/api/tmdb/buscar/${query}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar título no TMDB:", error);
    return [];
  }
}

export async function buscarDetalhes(id: number) {
  try {
    const response = await api.get(`/api/tmdb/detalhes/${id}`);
    return response.data; // retorna TODOS os detalhes da mídia
  } catch (error) {
    console.error("Erro ao buscar detalhes da mídia TMDB:", error);
    throw error;
  }
}
