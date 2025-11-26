import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AppModal from "@/components/AppModal";
import {
  buscarTituloTMDB,
  buscarDetalhes as buscarDetalhesService,
} from "../services/tmdb";
import {
  getMediaTypes,
  salvarMidiaApi,
  buscarMidiasParaExcluir,
  excluirMidia,
} from "../services/api";

import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MidiaBase() {
  // ------------------- ESTADOS PRINCIPAIS -------------------
  const [mode, setMode] = useState<"" | "cadastrar" | "editar" | "excluir">("");

  const [mediaTypes, setMediaTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");

  const [details, setDetails] = useState<any | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [isSerie, setIsSerie] = useState<boolean>(false);
  const [temporada, setTemporada] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [showSelectMediaType, setShowSelectMediaType] = useState(false);

  // ------------------- MODAL -------------------
  // Modal AppModal (mensagens)
  const [modalAppVisible, setModalAppVisible] = useState(false);

  // Modal de exclusão
  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);

  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [assistido, setAssistido] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [formatoMidia, setFormatoMidia] = useState("");

  const [queryExcluir, setQueryExcluir] = useState("");
  const [listaExcluir, setListaExcluir] = useState<any[]>([]);
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  const [midiaSelecionada, setMidiaSelecionada] = useState<any>(null);

  const inputExcluirRef = useRef<any>(null);

  const [loadingExcluirConfirm, setLoadingExcluirConfirm] = useState(false);

  async function handleConfirmarExclusao() {
    if (!midiaSelecionada) return;

    try {
      setLoadingExcluirConfirm(true);

      // chama a API de exclusão
      await excluirMidia(midiaSelecionada.id);

      // limpar estados da UI
      setQueryExcluir("");
      setListaExcluir([]);
      setMidiaSelecionada(null);
      setModalExcluirVisible(false); // fecha modal de exclusão

      // mostra feedback de sucesso
      showModal("Mídia excluída com sucesso!", "success");

      // foca no input novamente
      setTimeout(() => {
        inputExcluirRef.current?.focus?.();
      }, 50);
    } catch (error: any) {
      console.error("Erro ao excluir mídia:", error);

      // mostra feedback de erro
      showModal(error?.message || "Erro ao excluir a mídia", "error");
    } finally {
      setLoadingExcluirConfirm(false);
    }
  }

  // 2️⃣ Função para abrir Modal de exclusão
  function abrirModalExcluir(midia: any) {
    setMidiaSelecionada(midia);
    setModalExcluirVisible(true); // <<< trocado
  }

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

  async function handleBuscarParaExcluir(text: string) {
    setQueryExcluir(text);

    if (text.length < 2) {
      setListaExcluir([]);
      return;
    }

    setLoadingExcluir(true);
    const data = await buscarMidiasParaExcluir(text);
    setListaExcluir(Array.isArray(data) ? data : []);
    setLoadingExcluir(false);
  }

  // 1️⃣ Função para abrir AppModal
  function showModal(msg: string, type: "success" | "error" | "info" = "info") {
    setModalMessage(msg);
    setModalType(type);
    setModalAppVisible(true); // <<< trocado
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
      console.error("Erro ao carregar tipos de mídia:", err);
      showModal("Erro ao carregar tipos de mídia", "error");
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

      setDetails(null);
      setSearchResults([]);
      setSelectedType("");
      setTemporada("");
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
                          setAssistido(false);
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
  // ------------------- TELA DE EXCLUIR --------------------------
  // --------------------------------------------------------------
  function renderExcluir() {
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.excluirTitle}>🗑️ Excluir Mídia</Text>
        <Text style={styles.label}>Pesquisar</Text>
        <TextInput
          ref={inputExcluirRef}
          style={styles.input}
          placeholder="Digite para buscar..."
          placeholderTextColor="#555"
          value={queryExcluir}
          onChangeText={handleBuscarParaExcluir}
        />
        {loadingExcluir && (
          <Text style={{ marginTop: 10, color: "#999" }}>Buscando...</Text>
        )}
        {listaExcluir.length > 0 && (
          <View style={{ marginTop: 16 }}>
            {listaExcluir.map((item) => (
              <View key={item.id} style={styles.excluirItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.excluirTitulo}>
                    {item.tituloAlternativo}
                  </Text>
                  <Text style={styles.excluirInfo}>🎭 {item.generos}</Text>
                  <Text style={styles.excluirInfo}>
                    💿 {item.midiaTipoNome}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => abrirModalExcluir(item)}
                >
                  <Text style={styles.textoBotaoExcluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <Modal
          visible={modalExcluirVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalExcluirVisible(false)}
        >
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            style={styles.modalContainer}
          >
            <Animated.View
              entering={ZoomIn.duration(250)}
              exiting={ZoomOut.duration(200)}
              style={styles.modalContent}
            >
              {/* Ícone */}
              <View style={{ alignItems: "center", marginBottom: 15 }}>
                <MaterialIcons name="warning" size={48} color="#ff453a" />
              </View>

              <Text style={styles.modalTitle}>Confirmação de exclusão</Text>

              <Text style={styles.modalDescription}>
                Esta ação irá excluir permanentemente a mídia selecionada.
              </Text>

              <Text style={styles.modalSubtitle}>
                Tem certeza que deseja excluir a seguinte mídia?
              </Text>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#48484a",
                  marginVertical: 12,
                  opacity: 0.35,
                }}
              />

              {/* Bloco com informações */}
              {midiaSelecionada && (
                <View style={styles.infoBox}>
                  {midiaSelecionada.capaUrl && (
                    <Image
                      source={{ uri: midiaSelecionada.capaUrl }}
                      style={styles.capaImagem}
                    />
                  )}

                  <Text style={styles.infoTexto}>
                    <Text style={styles.label}>Título: </Text>
                    {midiaSelecionada.tituloAlternativo}
                  </Text>

                  <Text style={styles.infoTexto}>
                    <Text style={styles.label}>Tipo: </Text>
                    {midiaSelecionada.midiaTipoNome}
                  </Text>

                  <Text style={styles.infoTexto}>
                    <Text style={styles.label}>Assistido: </Text>
                    {midiaSelecionada.assistido ? "Sim" : "Não"}
                  </Text>

                  <Text style={styles.infoTexto}>
                    <Text style={styles.label}>Observações: </Text>
                    {midiaSelecionada.observacoes || "—"}
                  </Text>
                </View>
              )}

              {/* Botões */}
              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalExcluirVisible(false)}
                >
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoConfirmarExcluir}
                  onPress={handleConfirmarExclusao}
                  disabled={loadingExcluirConfirm}
                >
                  <Text style={styles.botaoConfirmarExcluirTexto}>
                    {loadingExcluirConfirm ? "Excluindo..." : "Excluir"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      </View>
    );
  }

  // --------------------------------------------------------------
  // ------------------- RENDER PRINCIPAL -------------------------
  // --------------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d1117" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }} // espaço para menu inferior + margem
          keyboardShouldPersistTaps="handled" // permite clicar em botões mesmo com teclado aberto
        >
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
          {mode === "excluir" && renderExcluir()}

          <AppModal
            visible={modalAppVisible}
            message={modalMessage}
            modalType={modalType}
            onClose={() => setModalAppVisible(false)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    fontWeight: "bold",
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
  excluirTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  excluirItem: {
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2b2f33",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  excluirTitulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  excluirInfo: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  botaoExcluir: {
    backgroundColor: "#d9534f",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  textoBotaoExcluir: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "88%",
    backgroundColor: "#2c2c2e",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#3a3a3c",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 14,
  },
  modalTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: "#c7c7cc",
    textAlign: "center",
    marginBottom: 14,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 14,
  },
  infoBox: {
    backgroundColor: "#3a3a3c",
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: "#48484a",
    marginBottom: 20,
  },
  infoTexto: {
    color: "#e5e5ea",
    fontSize: 15,
    marginBottom: 8,
  },
  capaImagem: {
    width: 140,
    height: 200,
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  botaoCancelar: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: "#636366",
    borderRadius: 12,
  },
  botaoCancelarTexto: {
    color: "#fff",
    fontWeight: "700",
  },
  botaoConfirmarExcluir: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
  },
  botaoConfirmarExcluirTexto: {
    color: "#fff",
    fontWeight: "700",
  },
});
