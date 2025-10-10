import { useState } from "react";
import { apiPost } from "app/services/api";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginUser = async (login: string, senha: string) => {
    setErrorMessage("");
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", { login, senha });
      return data;
    } catch {
      setErrorMessage("Erro ao conectar com o servidor!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, errorMessage, loginUser, setErrorMessage };
};
