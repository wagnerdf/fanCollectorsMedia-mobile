import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Switch,
} from "react-native";
import AppModal from "@/components/AppModal";
import {
  searchMovies,
  searchTvShows,
  getMovieDetails,
  getTvDetails,
  buscarTituloTMDB,
  buscarDetalhes as buscarDetalhesService,
} from "../services/tmdb";
import { getMediaTypes, salvarMidiaApi } from "../services/api";

export default function MidiaBase() {
  // ------------------- ESTADOS PRINCIPAIS -------------------
  const [mode, setMode] = useState<"" | "cadastrar" | "editar" | "excluir">("");

  const [mediaTypes, setMediaTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [isSerie, setIsSerie] = useState<boolean>(false);
  const [temporada, setTemporada] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [showSelectMediaType, setShowSelectMediaType] = useState(false);

  // ------------------- MODAL -------------------
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [assistido, setAssistido] = useState(false);

  const [numeroSerie, setNumeroSerie] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [formatoMidia, setFormatoMidia] = useState("");

  async function handleSearch(text: string) {
    setSearchQuery(text);
    setShowResults(true);

    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    const results = await buscarTituloTMDB(text);
    setSearchResults(results);
    setLoadingSearch(false);
  }

  function showModal(msg: string, type: "success" | "error" | "info" = "info") {
    setModalMessage(msg);
    setModalType(type);
    setModalVisible(true);
  }

  // ------------------- CARREGAR TIPOS DE MÍDIA -------------------
  useEffect(() => {
    loadMediaTypes();
  }, []);

  async function loadMediaTypes() {
    try {
      const data = await getMediaTypes();
      setMediaTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      showModal("Erro ao carregar tipos de mídia", "error");
    }
  }

  // ------------------- BUSCA TMDB -------------------
  // Debounce simples: disparado pelo onChangeText (aumente se precisar)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  async function buscar(text: string) {
    setQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const movies = await searchMovies(text);
        const tv = await searchTvShows(text);
        // anexa média de fonte: movies/tv devem trazer media_type, mas caso nao venham, normalizamos
        const normalizedMovies = Array.isArray(movies)
          ? movies.map((m: any) => ({
              ...m,
              media_type: m.media_type ?? "movie",
            }))
          : [];
        const normalizedTv = Array.isArray(tv)
          ? tv.map((t: any) => ({ ...t, media_type: t.media_type ?? "tv" }))
          : [];
        setSearchResults([...normalizedMovies, ...normalizedTv]);
      } catch (err) {
        showModal("Erro ao buscar mídias", "error");
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
  }

  async function handleSelect(item: any) {
    setSelectedItem(item);
    setIsSerie(item.media_type === "tv");
    await loadDetails(item);
  }

  async function loadDetails(item: any) {
    try {
      let info = null;
      if (item.media_type === "tv") info = await getTvDetails(item.id);
      else info = await getMovieDetails(item.id);
      setDetails(info ?? item); // se details vier vazio, mantemos o item básico
    } catch (err) {
      showModal("Erro ao carregar detalhes", "error");
    }
  }

  // ------------------- SALVAR (placeholder) -------------------
  async function salvarMidia() {
    if (!selectedType)
      return showModal("Selecione o tipo de mídia física", "error");

    if (isSerie && !temporada) return showModal("Informe a temporada", "error");

    if (!details)
      return showModal("Nenhum item do TMDB foi carregado", "error");

    setSaving(true);

    try {
      const body = {
        tituloOriginal: details.titulo_original || "",
        tituloAlternativo: details.titulo_alternativo || "",
        capaUrl: details.capa_url || "",
        assistido: !!assistido,
        observacoes: observacao || "",
        temporada: temporada || "",
        midiaTipoNome: selectedType,
        anoLancamento: Number(details.ano_lancamento) || null,
        generos: Array.isArray(details.generos)
          ? details.generos.join(", ")
          : details.generos || "",
        duracao: Number(details.duracao) || 0,
        linguagem: Array.isArray(details.linguagem)
          ? details.linguagem.join(", ")
          : details.linguagem || "",
        classificacaoEtaria: details.classificacao_etaria || "Livre",
        artistas: Array.isArray(details.artistas)
          ? details.artistas.join(", ")
          : details.artistas || "",
        diretores: Array.isArray(details.diretores)
          ? details.diretores.join(", ")
          : details.diretores || "",
        estudio: Array.isArray(details.estudio)
          ? details.estudio.join(", ")
          : details.estudio || "",
        notaMedia: Number(details.nota_media) || 0,
        sinopse: details.sinopse || "",
        midiaTipoId: selectedTypeId || null,
        formatoMidia: formatoMidia,
      };

      await salvarMidiaApi(body);

      showModal("Mídia cadastrada com sucesso!", "success");

      // limpar seleção após salvar
      setSelectedItem(null);
      setDetails(null);
      setQuery("");
      setSearchResults([]);
      setSelectedType("");
      setTemporada("");
      setNumeroSerie("");
      setObservacao("");
      setMode(""); // volta para home
    } catch (err) {
      console.error("Erro ao salvar mídia:", err);
      showModal("Erro ao salvar mídia", "error");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------------------
  // ------------------- INTERFACE DE MENU ------------------------
  // --------------------------------------------------------------
  function renderMenu() {
    return (
      <View style={styles.menuBox}>
        <TouchableOpacity
          style={[
            styles.menuButton,
            mode === "cadastrar" && styles.menuSelected,
          ]}
          onPress={() => setMode("cadastrar")}
        >
          <Text style={styles.menuText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, mode === "editar" && styles.menuSelected]}
          onPress={() => setMode("editar")}
        >
          <Text style={styles.menuText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, mode === "excluir" && styles.menuSelected]}
          onPress={() => setMode("excluir")}
        >
          <Text style={styles.menuText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --------------------------------------------------------------
  // ------------------- TELA INICIAL (SEM MODO) ------------------
  // --------------------------------------------------------------
  function renderHomeImage() {
    return (
      <View style={{ alignItems: "center", marginTop: 30 }}>
        {/* substitua o caminho da imagem se necessário */}
        <Image
          source={require("@/assets/images/midias.png")}
          style={{ width: 260, height: 260, opacity: 0.85 }}
        />
        <Text style={{ color: "#cbd5e1", marginTop: 12 }}>
          Selecione uma opção acima
        </Text>
      </View>
    );
  }

  // --------------------------------------------------------------
  // ------------------- TELA DE CADASTRAR ------------------------
  // --------------------------------------------------------------

  async function buscarDetalhes(id: number, tipoTMDB: string) {
    try {
      setLoadingSearch(true);

      // Agora enviamos corretamente o tipo recebido do item
      const data = await buscarDetalhesService(id, tipoTMDB);

      setDetails(data);
      setShowResults(false);
    } catch (error) {
      console.log("Erro ao carregar detalhes da mídia TMDB:", error);
    } finally {
      setLoadingSearch(false);
    }
  }

  function renderCadastrar() {
    return (
      <View style={{ marginTop: 20 }}>
        {/* SELECT TIPO DE MÍDIA */}
        <Text style={styles.label}>Tipo de Mídia Física</Text>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowSelectMediaType(!showSelectMediaType)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedType || "Selecione o tipo de mídia física"}
          </Text>
        </TouchableOpacity>

        {/* LISTA EXPANDIDA DO SELECT */}
        {showSelectMediaType && (
          <View style={styles.dropdownList}>
            {mediaTypes.map((t: any) => {
              const displayName = t.nome ?? t.name ?? t.label ?? String(t.id);
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.dropdownItem,
                    selectedType === displayName && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedType(displayName);
                    setSelectedTypeId(t.id);
                    setShowSelectMediaType(false);
                    // 🔥 limpar tudo ao trocar o tipo de mídia
                    setSearchQuery("");
                    setSearchResults([]);
                    setDetails(null);
                    setSelectedItem(null);
                    setIsSerie(false);
                    setTemporada("");
                    setObservacao("");
                    setShowResults(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{displayName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* CAMPO DE BUSCA SOMENTE APÓS ESCOLHER O TIPO */}
        {selectedType && (
          <>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Título</Text>

              <TextInput
                style={[
                  styles.input,
                  !selectedType && { opacity: 0.4 }, // 🔥 efeito visual de desabilitado
                ]}
                placeholder="Digite para buscar..."
                value={searchQuery}
                onChangeText={handleSearch}
                editable={!!selectedType} // 🔥 desabilita quando não há tipo selecionado
                placeholderTextColor="#555"
              />

              {loadingSearch && (
                <Text style={{ marginTop: 10, color: "#999" }}>
                  Buscando...
                </Text>
              )}

              {showResults && searchResults.length > 0 && (
                <View
                  style={{
                    backgroundColor: "#f9f9f9",
                    marginTop: 5,
                    borderRadius: 8,
                    padding: 10,
                    maxHeight: 200, // limita o tamanho
                  }}
                >
                  <ScrollView nestedScrollEnabled>
                    {searchResults.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{ paddingVertical: 8 }}
                        onPress={() => {
                          setSearchQuery(item.titulo_alternativo);

                          const tipoTMDB =
                            item.tipo === "Filme" ? "movie" : "tv";

                          // Define se é série para exibir o campo temporada
                          setIsSerie(item.tipo === "Série");

                          // Limpar temporada quando for filme
                          if (item.tipo === "Filme") {
                            setTemporada("");
                          }

                          setFormatoMidia(item.tipo);

                          buscarDetalhes(item.id, tipoTMDB);
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          {item.titulo_alternativo}
                        </Text>

                        <Text style={{ color: "#555" }}>
                          {item.ano} • {item.tipo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </>
        )}

        {/* DETALHES SOMENTE SE O USUÁRIO ESCOLHEU UMA MÍDIA */}
        {/* DETALHES APENAS SE A MÍDIA FOI SELECIONADA */}
        {details && (
          <View style={styles.detailsBox}>
            {/* TÍTULO */}
            <Text style={styles.detailsTitle}>
              {details.titulo_alternativo}
            </Text>

            {/* CAPA */}
            {details.capa_url && (
              <Image source={{ uri: details.capa_url }} style={styles.poster} />
            )}

            {/* ----------------------------- */}
            {/* CAMPO ASSISTIDO */}
            {/* ----------------------------- */}
            <View style={styles.row}>
              <Text style={styles.label}>Assistido</Text>
              <Switch
                value={assistido}
                onValueChange={setAssistido}
                style={{ marginLeft: 10 }}
              />
            </View>

            {/* ----------------------------- */}
            {/* OBSERVAÇÃO */}
            {/* ----------------------------- */}
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              placeholder="Observações da mídia"
              placeholderTextColor="#555"
              value={observacao}
              onChangeText={setObservacao}
            />

            {/* ----------------------------- */}
            {/* SE FOR SÉRIE → CAMPO TEMPORADA */}
            {/* ----------------------------- */}
            {isSerie && (
              <>
                <Text style={styles.label}>Temporada *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Informe a temporada"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={temporada}
                  onChangeText={setTemporada}
                />
              </>
            )}

            {/* ----------------------------- */}
            {/* DETALHES DA MÍDIA (READONLY) */}
            {/* ----------------------------- */}
            <View style={styles.divider} />

            <Text style={styles.label}>Formato Mídia</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={selectedType}
            />

            <Text style={styles.label}>Ano de Lançamento</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={String(details.ano_lancamento)}
            />

            <Text style={styles.label}>Gêneros</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={details.generos?.join(", ")}
            />

            <Text style={styles.label}>Duração</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={`${details.duracao} min`}
            />

            <Text style={styles.label}>Linguagem</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={details.linguagem}
            />

            <Text style={styles.label}>Classificação</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={details.classificacao_etaria}
            />

            <Text style={styles.label}>Artistas</Text>
            <TextInput
              style={[styles.readonly, { height: 80 }]}
              editable={false}
              multiline
              value={details.artistas?.join(", ")}
            />

            <Text style={styles.label}>Diretores</Text>
            <TextInput
              style={[styles.readonly, { height: 80 }]}
              editable={false}
              multiline
              value={details.diretores?.join(", ")}
            />

            <Text style={styles.label}>Estúdio(s)</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={details.estudio?.join(", ")}
            />

            <Text style={styles.label}>Nota Média</Text>
            <TextInput
              style={styles.readonly}
              editable={false}
              value={String(details.nota_media)}
            />

            <Text style={styles.label}>Sinopse</Text>
            <TextInput
              style={[styles.readonly, { height: 120 }]}
              editable={false}
              multiline
              value={details.sinopse}
            />
          </View>
        )}

        {/* BOTÃO SALVAR SOMENTE APÓS TER DETALHES */}
        {details && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={salvarMidia}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Salvar Mídia</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // --------------------------------------------------------------
  // ------------------- RENDER PRINCIPAL -------------------------
  // --------------------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gerenciar Mídias</Text>

      {renderMenu()}

      {mode === "" && renderHomeImage()}
      {mode === "cadastrar" && renderCadastrar()}
      {mode === "editar" && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.placeholder}>
            Tela de edição em desenvolvimento...
          </Text>
        </View>
      )}
      {mode === "excluir" && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.placeholder}>
            Tela de exclusão em desenvolvimento...
          </Text>
        </View>
      )}

      <AppModal
        visible={modalVisible}
        message={modalMessage}
        modalType={modalType}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0d1117",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  menuBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#161b22",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2b2f33",
  },
  menuSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  menuText: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    color: "#cbd5e1",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#161b22",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2b2f33",
  },
  selectBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Android ignore gap, but kept for web/future
    marginBottom: 8,
  },
  selectItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2b2f33",
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  selectText: {
    color: "#fff",
  },
  resultItem: {
    padding: 12,
    backgroundColor: "#0f1724",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  resultText: {
    color: "#fff",
  },
  detailsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#161b22",
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  poster: {
    width: 140,
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  placeholder: {
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  dropdownContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 4,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  dropdownButton: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#2b2f33",
    marginTop: 6,
  },
  dropdownButtonText: {
    color: "#cbd5e1",
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#2b2f33",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2b2f33",
  },

  dropdownItemSelected: {
    backgroundColor: "#2563eb33",
  },

  dropdownItemText: {
    color: "#fff",
    fontSize: 15,
  },
  readonly: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    color: "#333",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // agora ficam juntos
    gap: 10, // OU marginRight no Text
    marginVertical: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#666",
    marginVertical: 15,
  },
});
