import { API_BASE_URL } from "@env";

export const apiPost = async (endpoint: string, body: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
};
