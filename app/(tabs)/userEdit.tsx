import React, { useState, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { getUserProfile, updateUserProfile } from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { MaskedTextInput } from "react-native-mask-text";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function UserEdit() {
  const [screen, setScreen] = useState<
    "main" | "editData" | "editAddress" | "changePassword"
  >("main");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setScreen("main");
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setUserData(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💾 Função genérica para salvar dados (serve para dados, endereço ou senha)
  const handleSave = async (updatedFields?: Partial<typeof userData>) => {
    if (!userData) return;

    try {
      setIsSaving(true);

      // Mescla o que o usuário alterou com o que já temos
      const mergedData = {
        ...userData,
        ...updatedFields,
        endereco: {
          ...userData.endereco,
          ...(updatedFields?.endereco || {}),
        },
      };

      // Monta o payload completo exigido pelo backend
      const payload = {
        dataNascimento: mergedData.dataNascimento,
        sexo: mergedData.sexo,
        telefone: mergedData.telefone,
        cep: mergedData.endereco?.cep || "",
        rua: mergedData.endereco?.rua || "",
        numero: mergedData.endereco?.numero || "",
        complemento: mergedData.endereco?.complemento || "",
        bairro: mergedData.endereco?.bairro || "",
        cidade: mergedData.endereco?.cidade || "",
        estado: mergedData.endereco?.estado || "",
        novaSenha: mergedData.novaSenha || null,
      };

      console.log("📤 Enviando dados para salvar:", payload);

      // Chama o backend
      const updatedData = await updateUserProfile(payload);

      Alert.alert("✅ Sucesso", "Dados atualizados com sucesso!");

      if (updatedData) {
        setUserData({ ...userData, ...updatedData });
      }
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error.response?.data || error.message);
      Alert.alert("❌ Erro", "Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => setScreen("main");

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho com avatar */}
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color="#f5a623" />
        ) : (
          <>
            <Image
              source={
                userData?.avatarUrl
                  ? { uri: userData.avatarUrl }
                  : require("@/assets/default-user.png")
              }
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {userData ? `${userData.nome} ${userData.sobreNome}` : "Carregando..."}
            </Text>
            <Text style={styles.email}>{userData?.email || ""}</Text>
          </>
        )}
      </View>

      {/* Área dinâmica */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {screen === "main" && (
          <Animated.View
            key="main"
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.center}
          >
            <TouchableOpacity style={styles.option} onPress={() => setScreen("editData")}>
              <Text style={styles.optionText}>Editar Dados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setScreen("editAddress")}>
              <Text style={styles.optionText}>Editar Endereço</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setScreen("changePassword")}>
              <Text style={styles.optionText}>Alterar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#ff4d4d" style={{ marginRight: 8 }} />
              <Text style={[styles.optionText, { color: "#ff4d4d" }]}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Editar Dados */}
        {screen === "editData" && userData && (
          <Animated.View
            key="editData"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>📝 Editar Dados</Text>

            <ScrollView style={{ width: "100%" }}>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.inputDisabled} value={userData.nome} editable={false} />

              <Text style={styles.label}>Sobrenome</Text>
              <TextInput style={styles.inputDisabled} value={userData.sobreNome} editable={false} />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  style={styles.input}
                  value={
                    userData.dataNascimento
                      ? new Date(userData.dataNascimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                      : ""
                  }
                  placeholder="DD/MM/AAAA"
                  editable={false}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    userData.dataNascimento ? new Date(userData.dataNascimento) : new Date()
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split("T")[0];
                      setUserData({ ...userData, dataNascimento: formattedDate });
                    }
                  }}
                />
              )}

              <Text style={styles.label}>Sexo</Text>
              <Picker
                selectedValue={userData.sexo}
                onValueChange={(itemValue) =>
                  setUserData({ ...userData, sexo: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item label="Masculino" value="MASCULINO" />
                <Picker.Item label="Feminino" value="FEMININO" />
                <Picker.Item label="Outro" value="OUTRO" />
              </Picker>

              <Text style={styles.label}>Telefone</Text>
              <MaskedTextInput
                mask="(99) 99999-9999"
                style={styles.input}
                value={userData.telefone}
                keyboardType="phone-pad"
                onChangeText={(text, rawText) =>
                  setUserData({ ...userData, telefone: rawText })
                }
              />

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.inputDisabled} value={userData.email} editable={false} />

              {/* Botões */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() =>
                    handleSave({
                      dataNascimento: userData.dataNascimento,
                      sexo: userData.sexo,
                      telefone: userData.telefone,
                    })
                  }
                  disabled={isSaving}
                >
                  <Text style={styles.saveText}>
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  option: {
    backgroundColor: "#1e1e1e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 12,
    width: "85%",
    alignItems: "center",
  },
  optionText: {
    color: "#f5a623",
    fontSize: 16,
    fontWeight: "500",
  },
  subTitle: {
    color: "#f5a623",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
    marginTop: 12, 
  },
  backText: {
    color: "#f5a623",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutOption: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff4d4d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  // NOVOS ESTILOS PARA EDITAR DADOS
  label: {
    color: "#f5a623",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    marginTop: 15,
    paddingLeft: 5,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  picker: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#f5a623",
    paddingVertical: 12,
    //paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "60%",
  },
  saveText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputDisabled: {
    backgroundColor: "#2a2a2a",
    color: "#777",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 12, 
    width: "100%",
  },

});
