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

  const limit = 10;

  const carregarMidias = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const data = await getUserMidias(offset, limit);
    setMidias((prev) => [...prev, ...data.midias]);
    setHasMore(data.hasMore);
    setOffset((prev) => prev + limit);
    setLoading(false);
  };

  useEffect(() => {
    carregarMidias();
  }, []);

  const renderMidia = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.capaUrl }} style={styles.poster} />
      <Text style={styles.title} numberOfLines={2}>
        {item.tituloAlternativo}
      </Text>
    </TouchableOpacity>
  );

  const midiasFiltradas = midias.filter((m) =>
    m.tituloAlternativo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header com botão voltar e lista */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#00BFA6" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FanCollectorsMedia</Text>

        <TouchableOpacity onPress={() => console.log("Alternar modo lista")}>
          <Ionicons name="list-outline" size={26} color="#00BFA6" />
        </TouchableOpacity>
      </View>

      {/* Título principal */}
      <Text style={styles.mainTitle}>All my movies</Text>

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
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
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
    backgroundColor: "#fff",
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  card: {
    width: "32%",
    marginBottom: 20,
    marginRight: "2%", // espaço entre cards
    alignItems: "center",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 2,           // largura da borda
    borderColor: "#00BFA6",
    resizeMode: "cover",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});
