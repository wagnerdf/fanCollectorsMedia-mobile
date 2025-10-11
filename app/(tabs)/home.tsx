import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const biblioteca = [
    { label: "Todos os meus filmes", total: 64 },
  ];

  const generos = [
    { nome: "Ação", total: 12 },
    { nome: "Aventura", total: 9 },
    { nome: "Comédia", total: 7 },
    { nome: "Terror", total: 4 },
  ];

  const midias = [
    { tipo: "DVD", total: 23 },
    { tipo: "Blu-ray", total: 18 },
    { tipo: "VHS", total: 4 },
  ];

  const handleLogout = () => {
    router.replace("/auth/Login");
  };

  const renderItem = (item: any) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.nome || item.label || item.tipo}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.total}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <Text style={styles.appTitle}>FanCollectorsMedia</Text>

      {/* Seção Biblioteca */}
      <Text style={styles.sectionTitle}>Biblioteca</Text>
      <FlatList
        data={biblioteca}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.label}
      />

      {/* Seção Gêneros */}
      <Text style={styles.sectionTitle}>Gêneros</Text>
      <FlatList
        data={generos}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.nome}
      />

      {/* Seção Mídia */}
      <Text style={styles.sectionTitle}>Mídia</Text>
      <FlatList
        data={midias}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.tipo}
      />

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#cbd5e1",
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    backgroundColor: "#161b22",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#fff",
  },
  badge: {
    backgroundColor: "#238636",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    backgroundColor: "#d9534f",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
