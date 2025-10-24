import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getUserMidias,
  getMidiaById,
  getMidiasByGenero,
  getMidiasByTipo,
} from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// --- Modal de detalhes da mídia ---
const { width, height } = Dimensions.get("window");

const MidiaModal = ({ visible, midiaId, onClose }: any) => {
  const [midia, setMidia] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && midiaId) {
      setLoading(true);
      getMidiaById(midiaId)
        .then((data) => setMidia(data))
        .catch((err) => console.error("Erro ao carregar mídia:", err))
        .finally(() => setLoading(false));
    }
  }, [visible, midiaId]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          {loading ? (
            <ActivityIndicator color="#00BFA6" size="large" />
          ) : midia ? (
            <>
              {/* Área rolável */}
              <View style={modalStyles.scrollWrapper}>
                <ScrollView style={modalStyles.scrollArea} showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: midia.capaUrl }} style={modalStyles.fullPoster} />
                  {/* Título */}
                  <Text style={modalStyles.title}>{midia.tituloAlternativo}</Text>

                  {/* Seção: Informações Gerais */}
                  <Text style={modalStyles.sectionTitle}>Informações Gerais</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Gênero:</Text> {midia.generos}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Tipo:</Text> {midia.midiaTipoNome}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Formato:</Text> {midia.formatoMidia}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Duração:</Text> {midia.duracao} minutos</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Linguagem:</Text> {midia.linguagem}</Text>

                  {/* Seção: Detalhes Técnicos */}
                  <Text style={modalStyles.sectionTitle}>Detalhes Técnicos</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Observações:</Text> {midia.observacoes.trim() !== "" ? midia.observacoes : "—"}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Nota Média:</Text> {midia.notaMedia?.toFixed(1) ?? "—"}</Text>

                  {/* Seção: Créditos */}
                  <Text style={modalStyles.sectionTitle}>Créditos</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Artistas:</Text> {midia.artistas}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Diretores:</Text> {midia.diretores}</Text>
                  <Text style={modalStyles.infoText}><Text style={modalStyles.label}>Estúdio:</Text> {midia.estudio}</Text>
                  
                  {/* Seção: Créditos */}
                  <Text style={modalStyles.sectionTitle}>Sinopse</Text>
                  <Text style={modalStyles.infoText}><Text> {midia.sinopse}{"\n"}</Text></Text>
                </ScrollView>
                <LinearGradient
                  colors={["transparent", "#1E1E1E"]}
                  style={modalStyles.scrollIndicatorBottom}
                />
              </View>

              {/* Botão fixo fora da rolagem */}
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Text style={modalStyles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: "#fff" }}>Erro ao carregar mídia.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.85,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#00BFA6",
    justifyContent: "space-between",
  },
  scrollArea: {
    flex: 1,
  },
  poster: {
    width: "100%",         
    height: 220,           
    resizeMode: "contain", 
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 16,
    alignSelf: "center",  
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  genre: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
  rating: {
    color: "#FFD700",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  synopsis: {
    color: "#ddd",
    fontSize: 15,
    textAlign: "justify",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollWrapper: {
    flex: 1,
    position: "relative",
  },
  scrollIndicatorBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  fullPoster: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 16,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A73FF",
    marginTop: 12,
    marginBottom: 6,
    textAlign: "left",
  },
  label: {
    fontWeight: "700",
    color: "#FFD700",
  },
  infoText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
    textAlign: "left",
  },
});

// --- Library Screen ---
export default function LibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ genero?: string; tipo?: string }>();
  const genero = params.genero;
  const tipo = params.tipo;

  const [midias, setMidias] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modoLista, setModoLista] = useState(false);

  const [selectedMidiaId, setSelectedMidiaId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const limit = 10;

  const carregarMidias = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      let data: any = { midias: [], hasMore: false };

      if (genero) {
        const res = await getMidiasByGenero(genero, offset / limit, limit);
        data.midias = res.content;
        data.hasMore = res.hasMore;
      } else if (tipo) {
        const res = await getMidiasByTipo(tipo, offset / limit, limit);
        data.midias = res.content;
        data.hasMore = res.hasMore;
      } else {
        const res = await getUserMidias(offset, limit);
        data = res;
      }

      setMidias((prev) => (offset === 0 ? data.midias : [...prev, ...data.midias]));
      setHasMore(data.hasMore ?? false);
      setOffset((prev) => prev + limit);
    } catch (error) {
      console.log("Erro ao carregar mídias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    carregarMidias();
  }, [genero, tipo]);

  const renderMidia = ({ item }: any) => (
    <TouchableOpacity
      style={modoLista ? styles.listCard : styles.card}
      onPress={() => {
        setSelectedMidiaId(item.id);
        setShowModal(true);
      }}
    >
      {modoLista ? (
        <>
          <Image source={{ uri: item.capaUrl }} style={styles.listPoster} />
          <View style={styles.listInfo}>
            <Text style={styles.listTitle} numberOfLines={2}>
              {item.tituloAlternativo}
            </Text>
            <Text style={styles.listGenres} numberOfLines={2}>
              {item.generos}
            </Text>
            {item.notaMedia != null && (
              <Text style={styles.listRating}>⭐ {item.notaMedia.toFixed(1)}</Text>
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.midiaTipoNome}</Text>
          </View>
          <Image source={{ uri: item.capaUrl }} style={styles.poster} />
          <Text style={styles.title} numberOfLines={2}>
            {item.tituloAlternativo}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  const midiasFiltradas = midias.filter((m) =>
    m.tituloAlternativo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#00BFA6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FanCollectorsMedia</Text>
        <TouchableOpacity onPress={() => setModoLista(!modoLista)}>
          <Ionicons
            name={modoLista ? "grid-outline" : "list-outline"}
            size={26}
            color="#00BFA6"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.mainTitle}>
        {genero
          ? `Gênero: ${genero}`
          : tipo
          ? `Tipo: ${tipo}`
          : "Todos os meus filmes"}
      </Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#999"
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={midiasFiltradas}
        renderItem={renderMidia}
        keyExtractor={(item) => item.id.toString()}
        key={modoLista ? "list" : "grid"}
        numColumns={modoLista ? 1 : 3}
        columnWrapperStyle={
          modoLista ? undefined : { justifyContent: "flex-start" }
        }
        onEndReached={carregarMidias}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <MidiaModal
        visible={showModal}
        midiaId={selectedMidiaId}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

// --- Estilos principais ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#00BFA6" },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#fff" },
  card: {
    width: "32%",
    marginBottom: 20,
    marginRight: "2%",
    alignItems: "center",
    position: "relative",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00BFA6",
    resizeMode: "cover",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
    color: "#fff",
  },
  tag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 1,
  },
  tagText: { fontSize: 10, fontWeight: "700", color: "#000" },
  listCard: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00BFA6",
    padding: 8,
  },
  listPoster: {
    width: 80,
    height: 100,
    borderRadius: 4,
    resizeMode: "cover",
  },
  listInfo: { marginLeft: 12, flex: 1, justifyContent: "center" },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "left",
    marginBottom: 4,
  },
  listGenres: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "left",
    marginBottom: 2,
  },
  listRating: { fontSize: 14, color: "#FFD700", textAlign: "left" },
});
