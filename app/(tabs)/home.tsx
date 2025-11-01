import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView } from "react-native";
import { useAppData } from "../../src/context/AppDataContext";

export default function HomeScreen() {
  const router = useRouter();
  const [atualizando, setAtualizando] = useState(false);

  // Dados vindos do contexto global
  const { totalMidias, generos, tiposMidia, carregarDadosIniciais, carregando, jaCarregado, usuarioAtual } = useAppData();

  // Carrega apenas uma vez (ao logar)
  useEffect(() => {
    if (!jaCarregado) {
      carregarDadosIniciais();
    }
  }, [jaCarregado]);

  // Carrega dados iniciais na primeira vez ou quando trocar de usuário
  useEffect(() => {
    carregarDadosIniciais(true); // força recarregamento
  }, [usuarioAtual]); // <-- sempre que mudar de usuário

  const biblioteca = [{ label: "Todos os meus filmes", total: totalMidias }];

  const handleLogout = () => {
    router.replace("/auth/Login");
  };

  const handleReload = async () => {
    setAtualizando(true);
    await carregarDadosIniciais(true); // <- força o recarregamento
    setTimeout(() => setAtualizando(false), 1500);
  };

  const renderItem = (item: any, section?: string) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (section === "biblioteca") {
          router.push("/(tabs)/library");
        } else if (section === "generos") {
          router.push({
            pathname: "/(tabs)/library",
            params: { genero: item.nome },
          });
        } else if (section === "midias") {
          router.push({
            pathname: "/(tabs)/library",
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
    <View style={styles.container}>
      {/* Cabeçalho fixo */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>FanCollectorsMedia</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.reloadButton]}
            onPress={handleReload}
            disabled={atualizando}
          >
            <Text style={styles.headerButtonText}>
              {atualizando ? "Atualizando..." : "Recarregar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 60 }}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  header: {
    backgroundColor: "#0d1117",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#161b22",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  reloadButton: {
    backgroundColor: "#238636",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#cbd5e1",
    marginTop: 20,
    marginBottom: 10,
  },
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
  badge: {
    backgroundColor: "#238636",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { fontWeight: "bold", color: "#fff" },
});
