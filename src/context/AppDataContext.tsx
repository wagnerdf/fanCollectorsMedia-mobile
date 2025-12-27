import React, { createContext, useContext, useState, ReactNode } from "react";
import { getTotalMidias, getGeneros, getTipos } from "@/src/services/api"; 

// Tipos
interface Genero {
  nome: string;
  total: number;
}

interface TipoMidia {
  tipo: string;
  total: number;
}

interface AppDataContextType {
  totalMidias: number;
  generos: Genero[];
  tiposMidia: TipoMidia[];
  carregarDadosIniciais: (forcar?: boolean) => Promise<void>;
  carregando: boolean;
  jaCarregado: boolean;
  usuarioAtual: string | null; // <-- ID ou email do usuário logado
  setUsuarioAtual: (usuario: string | null) => void; // para atualizar o usuário
}

// Contexto
const AppDataContext = createContext<AppDataContextType>({} as AppDataContextType);

// Provider
interface ProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: ProviderProps) => {
  const [totalMidias, setTotalMidias] = useState<number>(0);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [tiposMidia, setTiposMidia] = useState<TipoMidia[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [jaCarregado, setJaCarregado] = useState<boolean>(false);
  const [usuarioAtual, setUsuarioAtual] = useState<string | null>(null); // <-- novo

  const carregarDadosIniciais = async (forcar = false) => {
    if (jaCarregado && !forcar) return; // evita recarregar, exceto quando forçar
    setCarregando(true);
    try {
      const [total, generosData, tiposData] = await Promise.all([
        getTotalMidias(),
        getGeneros(),
        getTipos(),
      ]);

      const generosArray: Genero[] = generosData.map((item: any) => ({
        nome: item.genero,
        total: item.total,
      }));

      setTotalMidias(total);
      setGeneros(generosArray);
      setTiposMidia(tiposData); 
      setJaCarregado(true);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        totalMidias,
        generos,
        tiposMidia,
        carregarDadosIniciais,
        carregando,
        jaCarregado,
        usuarioAtual,        // <-- adicionado
        setUsuarioAtual,     // <-- adicionado
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

// Hook de acesso
export const useAppData = () => useContext(AppDataContext);
