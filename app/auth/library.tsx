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
} from "react-native";
import { useRouter } from "expo-router";
import { getUserMidias } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function LibraryScreen() {
  const router = useRouter();
  const [midias, setMidias] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modoLista, setModoLista] = useState(false);

  const limit = 10;

  const carregarMidias = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getUserMidias(offset, limit);
      setMidias((prev) => [...prev, ...data.midias]);
      setHasMore(data.hasMore);
      setOffset((prev) => prev + limit);
    } catch (error) {
      console.log("Erro ao carregar mídias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMidias();
  }, []);

  const renderMidia = ({ item }: any) => {
    if (modoLista) {
      return (
        <TouchableOpacity style={styles.listCard}>
          <Image source={{ uri: item.capaUrl }} style={styles.listPoster} />
          <View style={styles.listInfo}>
            {/* Título */}
            <Text style={styles.listTitle} numberOfLines={2}>
              {item.tituloAlternativo}
            </Text>

            {/* Gêneros */}
            <Text style={styles.listGenres} numberOfLines={2}>
              {item.generos}
            </Text>

            {/* Nota Média */}
            {item.notaMedia != null && (
              <Text style={styles.listRating}>
                ⭐ {item.notaMedia.toFixed(1)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    } else {
      // Modo grid
      return (
        <TouchableOpacity style={styles.card}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tipo}</Text>
          </View>
          <Image source={{ uri: item.capaUrl }} style={styles.poster} />
          <Text style={styles.title} numberOfLines={2}>
            {item.tituloAlternativo}
          </Text>
        </TouchableOpacity>
      );
    }
  };

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

      {/* Título principal */}
      <Text style={styles.mainTitle}>Todos os meus filmes</Text>

      {/* Campo de busca */}
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

      {/* Lista de mídias */}
      <FlatList
        data={midiasFiltradas}
        renderItem={renderMidia}
        keyExtractor={(item) => item.id.toString()}
        key={modoLista ? "list" : "grid"} // Isso força o FlatList a renderizar novamente
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
    </View>
  );
}

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00BFA6",
  },
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
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
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
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
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
  listInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
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
  listRating: {
    fontSize: 14,
    color: "#FFD700",
    textAlign: "left",
  },
});
