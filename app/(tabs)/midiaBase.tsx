// midiaBase.tsx - versão completa gerada
// Arquivo inicial estruturado. Ajustaremos conforme for testando.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import AppModal from "@/components/AppModal";
import {
  searchMovies,
  searchTvShows,
  getMovieDetails,
  getTvDetails,
} from "../services/tmdb";
import { getMediaTypes } from "../services/api";

export default function MidiaBase() {
  const [mediaTypes, setMediaTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [isSerie, setIsSerie] = useState(false);

  const [temporada, setTemporada] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );

  function showModal(msg: string, type: "success" | "error" | "info" = "info") {
    setModalMessage(msg);
    setModalType(type);
    setModalVisible(true);
  }

  // Carregar tipos de mídia física
  React.useEffect(() => {
    loadMediaTypes();
  }, []);

  async function loadMediaTypes() {
    try {
      const data = await getMediaTypes();
      setMediaTypes(data || []);
    } catch (err) {
      showModal("Erro ao carregar tipos de mídia", "error");
    }
  }

  async function buscar(queryText: string) {
    setQuery(queryText);
    if (queryText.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const movies = await searchMovies(queryText);
      const tv = await searchTvShows(queryText);
      const final = [...movies, ...tv];
      setSearchResults(final);
    } catch (err) {
      showModal("Erro ao buscar mídias", "error");
    } finally {
      setLoadingSearch(false);
    }
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

      setDetails(info);
    } catch (err) {
      showModal("Erro ao carregar detalhes", "error");
    }
  }

  async function salvarMidia() {
    if (!selectedType)
      return showModal("Selecione o tipo de mídia física", "error");
    if (!selectedItem) return showModal("Selecione um filme ou série", "error");
    if (isSerie && !temporada) return showModal("Informe a temporada", "error");

    setSaving(true);

    try {
      showModal("Mídia cadastrada com sucesso!", "success");
      // Aqui iremos futuramente chamar o backend
    } catch (err) {
      showModal("Erro ao salvar mídia", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gerenciar Mídias</Text>

      {/* Select tipo físico */}
      <Text style={styles.label}>Tipo de Mídia Física</Text>
      <View style={styles.selectBox}>
        {mediaTypes.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.selectItem,
              selectedType === t.nome && styles.selected,
            ]}
            onPress={() => setSelectedType(t.nome)}
          >
            <Text style={styles.selectText}>{t.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Busca TMDB */}
      <Text style={styles.label}>Buscar Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar..."
        placeholderTextColor="#555"
        onChangeText={buscar}
      />

      {loadingSearch && (
        <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
      )}

      {searchResults.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.resultItem}
          onPress={() => handleSelect(item)}
        >
          <Text style={styles.resultText}>
            {item.title || item.name} ({item.media_type})
          </Text>
        </TouchableOpacity>
      ))}

      {/* Detalhes selecionados */}
      {details && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            {details.title || details.name}
          </Text>
          {details.poster_path && (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w300${details.poster_path}`,
              }}
              style={styles.poster}
            />
          )}

          {isSerie && (
            <View>
              <Text style={styles.label}>Temporada</Text>
              <TextInput
                style={styles.input}
                placeholder="Informe a temporada"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={temporada}
                onChangeText={setTemporada}
              />
            </View>
          )}

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            placeholder="Observações da mídia"
            placeholderTextColor="#555"
            value={observacao}
            onChangeText={setObservacao}
          />
        </View>
      )}

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
    marginBottom: 12,
    textAlign: "center",
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
    gap: 8,
    flexWrap: "wrap",
  },
  selectItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2b2f33",
  },
  selected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  selectText: {
    color: "#fff",
  },
  resultItem: {
    padding: 10,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    marginTop: 8,
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
});
