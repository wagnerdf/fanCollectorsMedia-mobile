// Buscar endereço pelo CEP (ViaCEP)
export const buscarEnderecoPorCep = async (cep: string) => {
  try {
    // remove traço e espaços
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) return null;

    return {
      cep: data.cep,
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};
