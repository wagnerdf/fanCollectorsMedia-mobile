import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  FadeInLeft,
  FadeOutRight,
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { MaskedTextInput } from "react-native-mask-text";
//import DateTimePicker from "@react-native-community/datetimepicker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getUserProfile,
  updateUserProfile,
} from "../../src/services/api";
import AppModal from "@/components/AppModal";
import { buscarEnderecoPorCep } from "../../src/services/viaCep";

export default function UserEdit() {
  const [screen, setScreen] = useState<
    "main" | "editData" | "editAddress" | "changePassword" | "confirmLogout"
  >("main");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [senhasIguais, setSenhasIguais] = useState(false);
  // Estado para acompanhar força da senha (nível, cor e porcentagem)
  const [senhaForca, setSenhaForca] = useState({
    nivel: "",
    cor: "",
    porcentagem: 0,
  });

  const router = useRouter();
  const barraWidth = useSharedValue(0);
  const [tempEndereco, setTempEndereco] = useState<any>(null);

  // Estado do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Função para exibir modal
  const showModal = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const handleConfirmDate = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    setUserData((prev: any) => ({
      ...prev,
      dataNascimento: date.toISOString(),
    }));
  };

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

  const validarEndereco = (endereco: any) => {
    const obrigatorios = ["cep", "rua", "numero", "bairro", "cidade", "estado"];
    for (const campo of obrigatorios) {
      if (!endereco[campo] || endereco[campo].trim() === "") {
        return false;
      }
    }
    return true;
  };

  // 💾 Função genérica para salvar dados (serve para dados, endereço ou senha)
  const handleSave = async (updatedFields?: Partial<typeof userData>) => {
    if (!userData) return;

    // ⚠️ Validação de telefone (formato brasileiro com DDD + 9 dígitos)
    if (userData.telefone) {
      const telefoneLimpo = userData.telefone.replace(/\D/g, "");
      if (telefoneLimpo.length < 11) {
        showModal(
          "Por favor, insira um número de telefone completo com DDD.",
          "error"
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      // Mescla o que o usuário alterou com os dados existentes
      const mergedData = {
        ...userData,
        ...updatedFields,
        endereco: {
          ...userData.endereco,
          ...(updatedFields?.endereco || {}),
        },
      };

      // 🔄 Converte data de nascimento para formato ISO (YYYY-MM-DD)
      const dataNascimentoISO = mergedData.dataNascimento
        ? new Date(mergedData.dataNascimento).toISOString().split("T")[0]
        : "";

      // Monta o payload completo exigido pelo backend
      const payload = {
        dataNascimento: dataNascimentoISO,
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
        senha: mergedData.senha || null,
      };

      console.log("📤 Enviando dados para salvar:", payload);

      // Chama o backend
      const updatedData = await updateUserProfile(payload);

      // ✅ Mostra modal de sucesso
      showModal("Dados atualizados com sucesso!", "success");

      if (updatedData) {
        setUserData({ ...userData, ...updatedData });
      }
    } catch (error: any) {
      //console.error("Erro ao salvar perfil:", error);

      // Captura a mensagem enviada pelo backend (JSON)
      let backendMessage = "Ocorreu um erro ao salvar. Tente novamente.";

      if (error.response?.status === 400 && error.response?.data) {
        if (typeof error.response.data === "string") {
          backendMessage = error.response.data;
        } else if (error.response.data.message) {
          backendMessage = error.response.data.message;
        }
      }

      // ❌ Mostra modal de erro com a mensagem do backend
      showModal(backendMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => setScreen("main");

  // Função de avaliação de força (versão adaptada)
  const avaliarForcaSenha = (senha: string) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[a-z]/.test(senha)) forca++;
    if (/\d/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    let nivel = "";
    let cor = "";
    let porcentagem = (forca / 5) * 100;

    if (forca <= 2) {
      nivel = "Senha fraca";
      cor = "red";
    } else if (forca === 3 || forca === 4) {
      nivel = "Senha média";
      cor = "orange";
    } else {
      nivel = "Senha forte";
      cor = "green";
    }

    setSenhaForca({ nivel, cor, porcentagem });
  };

  useEffect(() => {
    // Garante que userData existe
    if (!userData) return;

    // Avalia força da senha
    if (userData.novaSenha) {
      avaliarForcaSenha(userData.novaSenha);
    } else {
      setSenhaForca({ nivel: "", cor: "", porcentagem: 0 });
    }

    // Confirmação da senha
    setSenhasIguais(
      !!userData.novaSenha &&
        !!userData.confirmarSenha &&
        userData.novaSenha === userData.confirmarSenha
    );
  }, [userData]);

  // Atualiza a largura quando a porcentagem muda
  useEffect(() => {
    barraWidth.value = withTiming(senhaForca.porcentagem, { duration: 300 });
  }, [senhaForca.porcentagem]);

  useEffect(() => {
    if (screen === "changePassword") {
      // Limpa os campos de senha e indicadores
      setUserData((prev: any) => ({
        ...prev,
        novaSenha: "",
        confirmarSenha: "",
      }));
      setSenhaForca({ nivel: "", cor: "", porcentagem: 0 });
      setSenhasIguais(false);
    }
  }, [screen]);

  const senhaForte = senhaForca.nivel === "Senha forte";

  useEffect(() => {
    if (screen === "editAddress" && userData?.endereco) {
      setTempEndereco({ ...userData.endereco });
    }
  }, [screen, userData]);

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
              {userData
                ? `${userData.nome} ${userData.sobreNome}`
                : "Carregando..."}
            </Text>
            <Text style={styles.email}>{userData?.email || ""}</Text>
          </>
        )}
      </View>

      {/* Área dinâmica */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {screen === "main" && (
          <Animated.View
            key="main"
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.center}
          >
            <TouchableOpacity
              style={styles.option}
              onPress={() => setScreen("editData")}
            >
              <Text style={styles.optionText}>Editar Dados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setScreen("editAddress")}
            >
              <Text style={styles.optionText}>Editar Endereço</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setScreen("changePassword")}
            >
              <Text style={styles.optionText}>Alterar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutOption}
              onPress={() => setScreen("confirmLogout")}
            >
              <MaterialIcons
                name="logout"
                size={24}
                color="#ff4d4d"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.optionText, { color: "#ff4d4d" }]}>
                Sair
              </Text>
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
              <TextInput
                style={styles.inputDisabled}
                value={userData.nome}
                editable={false}
              />

              <Text style={styles.label}>Sobrenome</Text>
              <TextInput
                style={styles.inputDisabled}
                value={userData.sobreNome}
                editable={false}
              />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  style={styles.input}
                  value={
                    selectedDate
                      ? selectedDate.toLocaleDateString("pt-BR")
                      : userData.dataNascimento
                      ? new Date(userData.dataNascimento).toLocaleDateString(
                          "pt-BR"
                        )
                      : ""
                  }
                  placeholder="DD/MM/AAAA"
                  editable={false}
                />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                display="inline"
                themeVariant="dark"
                date={
                  selectedDate ||
                  (userData.dataNascimento
                    ? new Date(userData.dataNascimento)
                    : new Date(1990, 0, 1))
                }
                maximumDate={new Date()}
                onConfirm={handleConfirmDate}
                onCancel={() => setShowDatePicker(false)}
              />

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
              <TextInput
                style={styles.inputDisabled}
                value={userData.email}
                editable={false}
              />

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

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* Editar Endereço */}
        {screen === "editAddress" && userData && (
          <Animated.View
            key="editAddress"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>🏠 Editar Endereço</Text>

            <ScrollView style={{ width: "100%" }}>
              {/* CEP */}
              <Text style={styles.label}>CEP</Text>
              <MaskedTextInput
                mask="99999-999"
                style={styles.input}
                value={tempEndereco?.cep || ""}
                keyboardType="numeric"
                onChangeText={async (text, rawText) => {
                  const novoCep = rawText.replace(/\D/g, "");

                  // Atualiza apenas o CEP no tempEndereco
                  setTempEndereco({ ...tempEndereco, cep: rawText });

                  // Quando tiver 8 dígitos, dispara a busca
                  if (novoCep.length === 8) {
                    setIsLoadingCep(true);

                    try {
                      const endereco = await buscarEnderecoPorCep(novoCep);

                      if (endereco) {
                        // Atualiza apenas os campos retornados pela API, mantendo os demais
                        setTempEndereco({
                          ...tempEndereco, // mantém os campos existentes
                          ...endereco, // preenche os campos retornados
                          cep: rawText, // mantém o CEP formatado
                        });
                      }
                    } catch (error) {
                      console.error("Erro ao buscar CEP:", error);
                    } finally {
                      setIsLoadingCep(false);
                    }
                  }
                }}
              />

              {isLoadingCep && (
                <Text style={{ textAlign: "center", color: "#888" }}>
                  Buscando endereço...
                </Text>
              )}

              {/* Rua */}
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.rua || ""}
                onChangeText={(text) =>
                  setTempEndereco({ ...tempEndereco, rua: text })
                }
              />

              {/* Número */}
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.numero || ""}
                onChangeText={(text) =>
                  setTempEndereco({ ...tempEndereco, numero: text })
                }
                keyboardType="numeric"
              />

              {/* Complemento */}
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.complemento || ""}
                onChangeText={(text) =>
                  setTempEndereco({ ...tempEndereco, complemento: text })
                }
              />

              {/* Bairro */}
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.bairro || ""}
                onChangeText={(text) =>
                  setTempEndereco({ ...tempEndereco, bairro: text })
                }
              />

              {/* Cidade */}
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.cidade || ""}
                onChangeText={(text) =>
                  setTempEndereco({ ...tempEndereco, cidade: text })
                }
              />

              {/* Estado */}
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={tempEndereco?.estado || ""}
                maxLength={2}
                autoCapitalize="characters"
                onChangeText={(text) =>
                  setTempEndereco({
                    ...tempEndereco,
                    estado: text.toUpperCase(),
                  })
                }
              />

              {/* Botões */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    if (!validarEndereco(tempEndereco)) {
                      showModal(
                        "Por favor, preencha todos os campos obrigatórios antes de salvar.",
                        "info"
                      );
                      return;
                    }

                    handleSave({
                      endereco: { ...tempEndereco },
                    });
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.saveText}>
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* Editar Senha */}
        {screen === "changePassword" && (
          <Animated.View
            key="changePassword"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>🔒 Alterar Senha</Text>

            <ScrollView style={{ width: "100%" }}>
              {/* Nova Senha */}
              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                value={userData.novaSenha || ""}
                onChangeText={(text) =>
                  setUserData({
                    ...userData,
                    novaSenha: text,
                  })
                }
                secureTextEntry
                placeholder="Digite a nova senha"
                placeholderTextColor="#fff"
              />

              {/* Barra de força da senha */}
              {userData.novaSenha?.length > 0 && senhaForca.nivel !== "" && (
                <View style={styles.strengthContainer}>
                  <Animated.View
                    style={[
                      styles.strengthBar,
                      {
                        width: `${senhaForca.porcentagem}%`,
                        backgroundColor: senhaForca.cor,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.strengthText, { color: senhaForca.cor }]}
                  >
                    {senhaForca.nivel}
                  </Text>
                </View>
              )}

              {/* Confirmar Senha */}
              <Text style={[styles.label, { marginTop: 15 }]}>
                Confirmar Senha
              </Text>
              <TextInput
                style={styles.input}
                value={userData.confirmarSenha || ""}
                onChangeText={(text) =>
                  setUserData({
                    ...userData,
                    confirmarSenha: text,
                  })
                }
                secureTextEntry
                placeholder="Confirme a nova senha"
                placeholderTextColor="#fff"
              />

              {/* Validação visual de confirmação */}
              {userData.confirmarSenha?.length > 0 && (
                <Text
                  style={{
                    color: senhasIguais ? "green" : "red",
                    marginTop: 4,
                    fontWeight: "bold",
                  }}
                >
                  {senhasIguais
                    ? "✅ Senhas coincidem"
                    : "❌ Senhas não conferem"}
                </Text>
              )}

              {/* Botões */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!senhaForte || !senhasIguais) && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if (!userData.novaSenha || !userData.confirmarSenha) {
                      showModal(
                        "Por favor, preencha todos os campos obrigatórios.",
                        "info"
                      );
                      return;
                    }

                    if (!senhaForte) {
                      showModal(
                        "A senha deve ser forte antes de salvar.",
                        "error"
                      );
                      return;
                    }

                    if (userData.novaSenha !== userData.confirmarSenha) {
                      showModal("As senhas não conferem.", "error");
                      return;
                    }

                    handleSave({
                      senha: userData.novaSenha,
                    });
                  }}
                  disabled={!senhaForte || !senhasIguais || isSaving}
                >
                  <Text style={styles.saveText}>
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* Confirmação de Logout */}
        {screen === "confirmLogout" && (
          <Animated.View
            key="confirmLogout"
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
            style={styles.center}
          >
            <Text style={styles.subTitle}>⚠️ Deseja realmente sair?</Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                marginTop: 20,
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.saveButton, { width: "45%" }]}
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem("userToken");
                    router.replace("/"); // Redireciona para tela de login
                  } catch (error) {
                    console.error("Erro ao fazer logout:", error);
                  }
                }}
              >
                <Text style={styles.saveText}>Sim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.backButton, { width: "45%" }]}
                onPress={() => setScreen("main")}
              >
                <Text style={styles.backText}>Não</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <AppModal
        visible={modalVisible}
        message={modalMessage}
        modalType={modalType}
        onClose={() => {
          setModalVisible(false);
          // Se for modal de sucesso, volta para a tela principal
          if (modalType === "success") {
            setScreen("main");
          }
        }}
      />
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
  strengthContainer: {
    width: "100%",
    height: 25,
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#eee",
    overflow: "hidden",
    justifyContent: "center",
  },

  strengthBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },

  strengthText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
});
