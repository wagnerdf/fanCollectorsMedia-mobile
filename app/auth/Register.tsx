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
import { cadastrarUsuarioCompleto, buscarEnderecoPorCep } from "../services/api";

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
      const response = await cadastrarUsuarioCompleto(payload);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.push("/login");
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao cadastrar. Verifique os dados e tente novamente.");
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
        <Text style={styles.title}>🧑‍💻 Cadastrar Fan Colecionador de Mídia</Text>

        {/* Campos principais */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#888"
            value={form.nome}
            onChangeText={(t) => handleChange("nome", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Sobrenome"
            placeholderTextColor="#888"
            value={form.sobreNome}
            onChangeText={(t) => handleChange("sobreNome", t)}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Data Nascimento (AAAA-MM-DD)"
            placeholderTextColor="#888"
            value={form.dataNascimento}
            onChangeText={(t) => handleChange("dataNascimento", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Sexo"
            placeholderTextColor="#888"
            value={form.sexo}
            onChangeText={(t) => handleChange("sexo", t)}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#888"
            value={form.telefone}
            onChangeText={(t) => handleChange("telefone", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Avatar URL"
          placeholderTextColor="#888"
          value={form.avatarUrl}
          onChangeText={(t) => handleChange("avatarUrl", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={form.senha}
          onChangeText={(t) => {
            handleChange("senha", t);
            validarSenha(t);
          }}
        />
        {senhaForca ? <Text style={styles.info}>{senhaForca}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={form.confirmarSenha}
          onChangeText={(t) => handleChange("confirmarSenha", t)}
        />
        {erroSenha ? <Text style={styles.error}>{erroSenha}</Text> : null}

        {/* Endereço */}
        <Text style={styles.subTitle}>🏠 Endereço</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="CEP"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={form.endereco.cep}
            onChangeText={(t) => handleEnderecoChange("cep", t)}
            onBlur={handleBuscarCep}
          />
          <TextInput
            style={styles.input}
            placeholder="Rua"
            placeholderTextColor="#888"
            value={form.endereco.rua}
            onChangeText={(t) => handleEnderecoChange("rua", t)}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Número"
            placeholderTextColor="#888"
            value={form.endereco.numero}
            onChangeText={(t) => handleEnderecoChange("numero", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Complemento"
            placeholderTextColor="#888"
            value={form.endereco.complemento}
            onChangeText={(t) => handleEnderecoChange("complemento", t)}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            placeholderTextColor="#888"
            value={form.endereco.bairro}
            onChangeText={(t) => handleEnderecoChange("bairro", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            placeholderTextColor="#888"
            value={form.endereco.cidade}
            onChangeText={(t) => handleEnderecoChange("cidade", t)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Estado"
          placeholderTextColor="#888"
          value={form.endereco.estado}
          onChangeText={(t) => handleEnderecoChange("estado", t)}
        />

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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  subTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  input: {
    backgroundColor: "#1a2233",
    color: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
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
    marginBottom: 5,
  },
  error: {
    color: "#f87171",
    marginBottom: 5,
  },
});
