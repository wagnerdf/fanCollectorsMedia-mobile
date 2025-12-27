import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { cadastrarUsuarioCompleto } from "../../src/services/api";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { buscarEnderecoPorCep } from "../../src/services/viaCep";
import AppModal from "components/AppModal";

export default function RegisterFullScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">(
    "info"
  );
  const numeroRef = useRef<TextInput>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [senhaForca, setSenhaForca] = useState("");
  const [senhaCor, setSenhaCor] = useState("#000");

  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmColor, setConfirmColor] = useState("");

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

  type FormErrors = { [key: string]: string };
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const formatarCep = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 5) return apenasNumeros;
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
  };

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

  const handleBuscarCep = async (cepArg?: string) => {
    // usa o cep passado ou o que está no form
    const cepParaBuscar = (cepArg ?? form.endereco.cep).replace(/\D/g, "");

    if (!cepParaBuscar || cepParaBuscar.length !== 8) return null;

    try {
      setIsLoadingCep(true);
      const data = await buscarEnderecoPorCep(cepParaBuscar);
      if (data) {
        setForm((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.rua,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
          },
        }));

        // foca no número
        setTimeout(() => {
          numeroRef.current?.focus();
        }, 100);
      } else {
        setModalMessage("CEP inválido! Não foi possível encontrar o endereço.");
        setModalType("error");
        setModalVisible(true);
      }
    } catch (err) {
      console.error("Erro buscar CEP:", err);
      setModalMessage("Erro ao buscar CEP. Tente novamente.");
      setModalType("error");
      setModalVisible(true);
    } finally {
      setIsLoadingCep(false);
    }

    return null;
  };

  const handleCadastrar = async () => {
    const errors = validateFields();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      setModalMessage("Preencha os campos obrigatórios antes de continuar.");
      setModalType("error");
      setModalVisible(true);

      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      dataNascimento: selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "",
    };

    try {
      await cadastrarUsuarioCompleto(payload);
      setModalMessage("Usuário cadastrado com sucesso!");
      setModalType("success");
      setModalVisible(true);

      setTimeout(() => router.push("/auth/Login"), 1500);
    } catch (error: any) {
      let msg = "Falha ao cadastrar. Verifique os dados.";

      // Se a API retornou mensagem estruturada (ex: {campo: "mensagem"})
      if (error.response?.data) {
        const data = error.response.data;

        // Pegar primeira mensagem de erro da API
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          msg = data[firstKey]; 
        }
      }

      setModalMessage(msg);
      setModalType("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    const somenteNumeros = valor.replace(/\D/g, "");

    if (somenteNumeros.length <= 10) {
      // formato fixo: (99) 9999-9999
      return somenteNumeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    // formato celular: (99) 99999-9999
    return somenteNumeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const validarSenha = (senha: string) => {
    let forca = 0;

    if (senha.length >= 6) forca++;
    if (/[a-z]/.test(senha)) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    if (forca <= 2) {
      setSenhaForca("Senha fraca");
      setSenhaCor("#FF4D4D");
    } else if (forca === 3 || forca === 4) {
      setSenhaForca("Senha média");
      setSenhaCor("#FFC300");
    } else if (forca === 5) {
      setSenhaForca("Senha forte");
      setSenhaCor("#2ECC71");
    }
  };

  const validateFields = () => {
    const errors: any = {};

    // Dados pessoais
    if (!form.nome.trim()) errors.nome = "Nome é obrigatório";

    if (!form.sobreNome.trim()) errors.sobreNome = "Sobrenome é obrigatório";

    if (!selectedDate)
      errors.dataNascimento = "Data de nascimento é obrigatória";

    if (!form.sexo) errors.sexo = "Selecione um sexo";

    // Telefone
    if (!form.telefone.trim() || form.telefone.replace(/\D/g, "").length < 10)
      errors.telefone = "Telefone inválido";

    // Email
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Email inválido";

    // Senha
    if (!form.senha) errors.senha = "Senha é obrigatória";

    if (
      form.senha &&
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        form.senha
      )
    ) {
      errors.senha =
        "A senha deve ter 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial";
    }

    if (form.senha !== form.confirmarSenha)
      errors.confirmarSenha = "As senhas não conferem";

    // Endereço
    if (!form.endereco.cep || form.endereco.cep.replace(/\D/g, "").length !== 8)
      errors.cep = "CEP inválido";

    if (!form.endereco.rua.trim()) errors.rua = "Rua é obrigatória";

    if (!form.endereco.numero.trim()) errors.numero = "Número é obrigatório";

    if (!form.endereco.bairro.trim()) errors.bairro = "Bairro é obrigatório";

    if (!form.endereco.cidade.trim()) errors.cidade = "Cidade é obrigatória";

    if (!form.endereco.estado.trim()) errors.estado = "Estado é obrigatório";

    return errors;
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
        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={(t) => handleChange("nome", t)}
            />
            {formErrors.nome && (
              <Text style={styles.error}>{formErrors.nome}</Text>
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.input}
              value={form.sobreNome}
              onChangeText={(t) => handleChange("sobreNome", t)}
            />
            {formErrors.sobreNome && (
              <Text style={styles.error}>{formErrors.sobreNome}</Text>
            )}
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
                placeholderTextColor="#9F9F5F"
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
            {formErrors.dataNascimento && (
              <Text style={styles.error}>{formErrors.dataNascimento}</Text>
            )}
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Sexo</Text>
            <View style={styles.selectWrapper}>
              {/* Select de sexo do usuário */}
              <Picker
                selectedValue={form.sexo}
                onValueChange={(value) => handleChange("sexo", value)}
                style={styles.selectPicker}
                dropdownIconColor="#fff"
                mode="dialog"
              >
                {/* Opções do select */}
                <Picker.Item label="Selecione..." value="" color="#9F9F5F" />
                <Picker.Item
                  label="Masculino"
                  value="MASCULINO"
                  color="#0A0F1C"
                />
                <Picker.Item
                  label="Feminino"
                  value="FEMININO"
                  color="#0A0F1C"
                />
                <Picker.Item label="Outro" value="OUTRO" color="#0A0F1C" />
              </Picker>
            </View>
            {formErrors.sexo && (
              <Text style={styles.error}>{formErrors.sexo}</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ width: 180 }}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, styles.telefoneInput]}
              keyboardType="phone-pad"
              maxLength={15} // (99) 99999-9999
              value={form.telefone}
              onChangeText={(t) => {
                const telefoneMasc = formatarTelefone(t);
                handleChange("telefone", telefoneMasc);
              }}
            />
            {formErrors.telefone && (
              <Text style={styles.error}>{formErrors.telefone}</Text>
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => handleChange("email", t)}
            />
            {formErrors.email && (
              <Text style={styles.error}>{formErrors.email}</Text>
            )}
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
        <View style={styles.divider} />

        <View style={styles.inputBox}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, { borderColor: senhaCor, borderWidth: 1 }]}
            secureTextEntry
            value={form.senha}
            onChangeText={(t) => {
              handleChange("senha", t);
              validarSenha(t);
            }}
          />
          <View style={styles.linhaMensagem}>
            {senhaForca ? (
              <Text style={[styles.info, { color: senhaCor, marginRight: 10 }]}>
                {senhaForca}
              </Text>
            ) : null}

            {formErrors.senha ? (
              <Text style={styles.error}>{formErrors.senha}</Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.inputBox, { marginTop: 20, marginBottom: 20 }]}>
          <Text style={styles.label}>Confirmar Senha</Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            value={form.confirmarSenha}
            onChangeText={(t) => {
              handleChange("confirmarSenha", t);

              if (t.length === 0) {
                setConfirmMsg("");
                setConfirmColor("");
                return;
              }

              if (t === form.senha) {
                setConfirmMsg("As senhas conferem");
                setConfirmColor("#2ECC71");
              } else {
                setConfirmMsg("As senhas não conferem");
                setConfirmColor("red");
              }
            }}
          />

          {/* 🔥 Mensagens lado a lado */}
          <View style={styles.linhaMensagem}>
            {confirmMsg !== "" && (
              <Text style={{ color: confirmColor, marginRight: 10 }}>
                {confirmMsg}
              </Text>
            )}

            {erroSenha ? <Text style={styles.error}>{erroSenha}</Text> : null}
          </View>
        </View>

        {/* Endereço */}
        <Text style={styles.sectionTitle}>🏠 Endereço</Text>
        <View style={styles.divider} />

        {/* CEP + Rua */}
        <View style={styles.rowCepRua}>
          <View style={styles.inputBoxCep}>
            <Text style={styles.label}>CEP</Text>

            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={9}
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off" // este é o único válido hoje
              textContentType="none"
              value={form.endereco.cep}
              onChangeText={(t) => {
                const cepMascarado = formatarCep(t);
                setForm((prev) => ({
                  ...prev,
                  endereco: { ...prev.endereco, cep: cepMascarado },
                }));

                if (cepMascarado.replace(/\D/g, "").length === 8) {
                  handleBuscarCep(cepMascarado);
                }
              }}
              onBlur={() => handleBuscarCep()}
            />
            {formErrors.cep && (
              <Text style={styles.error}>{formErrors.cep}</Text>
            )}
          </View>

          <View style={styles.inputBoxRua}>
            <Text style={styles.label}>Rua</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.rua}
              onChangeText={(t) => handleEnderecoChange("rua", t)}
            />
            {formErrors.rua && (
              <Text style={styles.error}>{formErrors.rua}</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBoxNumero}>
            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              ref={numeroRef}
              value={form.endereco.numero}
              onChangeText={(t) => handleEnderecoChange("numero", t)}
            />
            {formErrors.numero && (
              <Text style={styles.error}>{formErrors.numero}</Text>
            )}
          </View>

          <View style={styles.inputBoxComplemento}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.complemento}
              onChangeText={(t) => handleEnderecoChange("complemento", t)}
            />
          </View>
        </View>

        <View style={[styles.row, { marginBottom: 5 }]}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.bairro}
              onChangeText={(t) => handleEnderecoChange("bairro", t)}
            />
            {formErrors.bairro && (
              <Text style={styles.error}>{formErrors.bairro}</Text>
            )}
          </View>

          <View style={styles.inputBoxEstado}>
            <Text style={styles.label}>Estado</Text>
            <TextInput
              style={styles.input}
              value={form.endereco.estado}
              onChangeText={(t) => handleEnderecoChange("estado", t)}
            />
            {formErrors.estado && (
              <Text style={styles.error}>{formErrors.estado}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputBoxMaior}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={form.endereco.cidade}
            onChangeText={(t) => handleEnderecoChange("cidade", t)}
          />
          {formErrors.cidade && (
            <Text style={styles.error}>{formErrors.cidade}</Text>
          )}
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
      {/* ✅ Modal */}
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        modalType={modalType}
        onClose={() => setModalVisible(false)}
      />
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
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  input: {
    backgroundColor: "#1a2233",
    color: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 2,
    fontSize: 16,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: "#1a2233",
    borderRadius: 10,
    marginBottom: 10,
    height: 45,
    justifyContent: "center",
  },
  picker: {
    color: "#9F9F5F",
    width: "100%",
  },
  inputBoxMaior: {
    flex: 2,
    marginBottom: 10,
  },
  inputBoxCep: {
    width: 110,
    marginRight: 10,
  },
  inputBoxRua: {
    flex: 1,
  },
  rowCepRua: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  inputBoxNumero: {
    width: 80,
  },
  inputBoxEstado: {
    width: 60,
  },
  inputBoxComplemento: {
    flex: 1,
  },
  telefoneInput: {
    width: 15 * 12,
    maxWidth: "100%",
  },
  selectWrapper: {
    backgroundColor: "#1A2233", // fundo real
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    height: 41, // igual aos outros inputs
    justifyContent: "center",
    overflow: "hidden",
  },
  selectPicker: {
    color: "#fff", // cor da fonte
    backgroundColor: "transparent", // evitar fundo branco interno
    fontSize: 18,
    height: 50,
    width: "100%",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#2f3b52", // pode clarear ou escurecer, como quiser
    marginTop: 5,
    marginBottom: 15,
  },
  linhaMensagem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});
