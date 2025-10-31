import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput, Platform } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { getUserProfile } from "../services/api";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { MaskedTextInput } from "react-native-mask-text";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function UserEdit() {
  const [screen, setScreen] = useState<"main" | "editData" | "editAddress" | "changePassword">("main");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Router do Expo Router para navegação
  const router = useRouter();

  // 🔁 Atualiza a tela principal e carrega os dados do usuário ao ganhar foco
  useFocusEffect(
    useCallback(() => {
      setScreen("main");
      fetchUserData();
    }, [])
  );

  // 📌 Função para buscar perfil do usuário logado
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

  // 🔙 Volta para a tela principal do usuário
  const handleBack = () => setScreen("main");

  // 🔒 Logout do usuário, removendo token e redirecionando para login
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken"); // remove token
      router.replace("/"); // volta para tela inicial
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho fixo com avatar, nome e email */}
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color="#f5a623" />
        ) : (
          <>
            <Image
              source={
                userData?.avatarUrl
                  ? { uri: userData.avatarUrl }
                  : require("@/assets/default-user.png") // fallback seguro
              }
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {userData ? `${userData.nome} ${userData.sobreNome}` : "Carregando..."}
            </Text>
            <Text style={styles.email}>
              {userData?.email || ""}
            </Text>
          </>
        )}
      </View>

      {/* Área dinâmica com as seções */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {screen === "main" && (
          <Animated.View
            key="main"
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.center}
          >
            {/* Opções do usuário */}
            <TouchableOpacity style={styles.option} onPress={() => setScreen("editData")}>
              <Text style={styles.optionText}>Editar Dados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setScreen("editAddress")}>
              <Text style={styles.optionText}>Editar Endereço</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setScreen("changePassword")}>
              <Text style={styles.optionText}>Alterar Senha</Text>
            </TouchableOpacity>

            {/* 🔒 Botão de logoff */}
            <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#ff4d4d" style={{ marginRight: 8 }} />
              <Text style={[styles.optionText, { color: "#ff4d4d" }]}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Seções de edição */}
        {screen === "editData" && userData && (
          <Animated.View
            key="editData"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>📝 Editar Dados</Text>

            <ScrollView style={{ width: "100%" }}>

              {/* Nome */}
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.inputDisabled}
                value={userData.nome}
                editable={false}
              />

              {/* Sobrenome */}
              <Text style={styles.label}>Sobrenome</Text>
              <TextInput
                style={styles.inputDisabled}
                value={userData.sobreNome}
                editable={false}
              />

              {/* Data de Nascimento */}
              <Text style={styles.label}>Data de Nascimento</Text>

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  style={styles.input}
                  value={
                    userData.dataNascimento
                      ? new Date(userData.dataNascimento)
                          .toLocaleDateString("pt-BR", { timeZone: "UTC" })
                      : ""
                  }
                  placeholder="DD/MM/AAAA"
                  editable={false}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    userData.dataNascimento
                      ? new Date(userData.dataNascimento)
                      : new Date()
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      // Converte para o formato yyyy-MM-dd para o backend, mas exibe como dd/MM/yyyy
                      const formattedDate = selectedDate.toISOString().split("T")[0];
                      setUserData({ ...userData, dataNascimento: formattedDate });
                    }
                  }}
                />
              )}

              {/* Sexo */}
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

              {/* Telefone */}
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

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.inputDisabled}
                value={userData.email}
                editable={false}
              />

              {/* Botão Salvar */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => console.log("Salvar (em breve será implementado)")}
                >
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* Seções de endereço */}
        {screen === "editAddress" && (
          <Animated.View
            key="editAddress"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>🏠 Editar Endereço</Text>
            <Text style={styles.subText}>Formulário para editar o endereço do usuário.</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Seções de password */}
        {screen === "changePassword" && (
          <Animated.View
            key="changePassword"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>🔒 Alterar Senha</Text>
            <Text style={styles.subText}>Tela para troca de senha do usuário.</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
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
    gap: 12, // espaçamento entre os dois botões
    width: "100%",
  },

});
