import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView } from "react-native";
import { useAppData } from "../../src/context/AppDataContext";

export default function HomeScreen() {
  const router = useRouter();

  // Dados vindos do contexto global
  const { totalMidias, generos, tiposMidia, carregarDadosIniciais, carregando, jaCarregado } = useAppData();

  // Carrega apenas uma vez (ao logar)
  useEffect(() => {
    if (!jaCarregado) {
      carregarDadosIniciais();
    }
  }, [jaCarregado]);

  const biblioteca = [{ label: "Todos os meus filmes", total: totalMidias }];

  const handleLogout = () => {
    router.replace("/auth/Login");
  };

  const renderItem = (item: any, section?: string) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (section === "biblioteca") {
          router.push("/auth/library");
        } else if (section === "generos") {
          router.push({
            pathname: "/auth/library",
            params: { genero: item.nome },
          });
        } else if (section === "midias") {
          router.push({
            pathname: "/auth/library",
            params: { tipo: item.tipo },
          });
        }
      }}
    >
      <Text style={styles.itemText}>{item.nome || item.label || item.tipo}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.total}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.appTitle}>FanCollectorsMedia</Text>

      <Text style={styles.sectionTitle}>Biblioteca</Text>
      <FlatList
        data={biblioteca}
        renderItem={({ item }) => renderItem(item, "biblioteca")}
        keyExtractor={(item) => item.label}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Gêneros</Text>
      {carregando && !jaCarregado ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={generos}
          renderItem={({ item }) => renderItem(item, "generos")}
          keyExtractor={(item) => item.nome}
          scrollEnabled={false}
        />
      )}

      <Text style={styles.sectionTitle}>Mídia</Text>
      {carregando && !jaCarregado ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={tiposMidia}
          renderItem={({ item }) => renderItem(item, "midias")}
          keyExtractor={(item) => item.tipo}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117", paddingHorizontal: 20, paddingTop: 60 },
  appTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 30, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#cbd5e1", marginTop: 20, marginBottom: 10 },
  loadingText: { color: "#fff", marginBottom: 10 },
  item: {
    backgroundColor: "#161b22",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemText: { fontSize: 16, color: "#fff" },
  badge: { backgroundColor: "#238636", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontWeight: "bold", color: "#fff" },
  button: { backgroundColor: "#d9534f", paddingVertical: 14, borderRadius: 12, marginTop: 40, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
