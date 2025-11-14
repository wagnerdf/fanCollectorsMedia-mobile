import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  cadastrarUsuarioCompleto,
  buscarEnderecoPorCep,
} from "../services/api";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";

export default function RegisterFullScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [senhaForca, setSenhaForca] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [form, setForm] = useState({
    nome: "",
    sobreNome: "",
    dataNascimento: "",
    sexo: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    avatarUrl: "",
    status: "BLOQUEADO",
    endereco: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const openDatePicker = () => setShowDatePicker(true);
  const closeDatePicker = () => setShowDatePicker(false);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    closeDatePicker();
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setForm({
      ...form,
      endereco: { ...form.endereco, [field]: value },
    });
  };

  const handleBuscarCep = async () => {
    if (!form.endereco.cep) return;
    const data = await buscarEnderecoPorCep(form.endereco.cep);
    if (data) {
      setForm({
        ...form,
        endereco: {
          ...form.endereco,
          rua: data.rua,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
        },
      });
    } else {
      Alert.alert("CEP inválido", "Não foi possível encontrar o endereço.");
    }
  };

  const validarSenha = (senha: string) => {
    setSenhaForca(senha.length < 6 ? "Senha fraca" : "Senha forte");
  };

  const handleCadastrar = async () => {
    if (form.senha !== form.confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    setErroSenha("");
    setLoading(true);

    const payload = {
      ...form,
      endereco: { ...form.endereco },
      dataNascimento: form.dataNascimento || "2000-01-01",
    };

    try {
      await cadastrarUsuarioCompleto(payload);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.push("/login");
    } catch (error) {
      Alert.alert(
        "Erro",
        "Falha ao cadastrar. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          🧑‍💻 Cadastro do Fan Colecionador de Mídia
        </Text>

        {/* Dados Pessoais */}
        <Text style={styles.sectionTitle}>📌 Dados Pessoais</Text>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={(t) => handleChange("nome", t)}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.input}
              value={form.sobreNome}
              onChangeText={(t) => handleChange("sobreNome", t)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nascimento</Text>

            <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8}>
              <TextInput
                style={styles.input}
                value={
                  selectedDate ? selectedDate.toLocaleDateString("pt-BR") : ""
                }
                placeholder="DD/MM/AAAA"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={closeDatePicker}
              maximumDate={new Date()}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Sexo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.sexo}
                onValueChange={(value) => handleChange("sexo", value)}
                dropdownIconColor="#fff"
                style={styles.picker}
              >
                <Picker.Item label="Selecione..." value="" />
                <Picker.Item label="Masculino" value="MASCULINO" />
                <Picker.Item label="Feminino" value="FEMININO" />
                <Picker.Item label="Outro" value="OUTRO" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={form.telefone}
              onChangeText={(t) => handleChange("telefone", t)}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => handleChange("email", t)}
            />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            style={styles.input}
            value={form.avatarUrl}
            onChangeText={(t) => handleChange("avatarUrl", t)}
          />
        </View>

        {/* Senha */}
        <Text style={styles.sectionTitle}>🔐 Criação da Senha</Text>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={form.senha}
            onChangeText={(t) => {
              handleChange("senha", t);
              validarSenha(t);
            }}
          />
          {senhaForca ? <Text style={styles.info}>{senhaForca}</Text> : null}
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={form.confirmarSenha}
            onChangeText={(t) => handleChange("confirmarSenha", t)}
          />
          {erroSenha ? <Text style={styles.error}>{erroSenha}</Text> : null}
        </View>

        {/* Endereço */}
        <Text style={styles.sectionTitle}>🏠 Endereço</Text>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.endereco.cep}
              onChangeText={(t) => handleEnderecoChange("cep", t)}
              onBlur={handleBuscarCep}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Rua</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.rua}
              onChangeText={(t) => handleEnderecoChange("rua", t)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.numero}
              onChangeText={(t) => handleEnderecoChange("numero", t)}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.complemento}
              onChangeText={(t) => handleEnderecoChange("complemento", t)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.bairro}
              onChangeText={(t) => handleEnderecoChange("bairro", t)}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.cidade}
              onChangeText={(t) => handleEnderecoChange("cidade", t)}
            />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={form.endereco.estado}
            onChangeText={(t) => handleEnderecoChange("estado", t)}
          />
        </View>

        {/* Botões */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cadastrarButton]}
            onPress={handleCadastrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🪪 Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.voltarButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>↩️ Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0a0f1c",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  sectionTitle: {
    color: "#60a5fa",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
  },
  label: {
    color: "#ccc",
    marginBottom: 3,
    fontSize: 14,
  },
  inputBox: {
    flex: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  input: {
    backgroundColor: "#1a2233",
    color: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cadastrarButton: {
    backgroundColor: "#22c55e",
  },
  voltarButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  info: {
    color: "#facc15",
    marginTop: 2,
  },
  error: {
    color: "#f87171",
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: "#1a2233",
    borderRadius: 10,
    marginBottom: 10,
    height: 45,
  },
  picker: {
    color: "#9F9F5F",
    width: "100%",
  },
});
