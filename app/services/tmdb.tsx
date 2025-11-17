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
