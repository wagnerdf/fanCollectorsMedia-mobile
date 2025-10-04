import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Preencha email e senha!");
      return;
    }

    try {
      // Aqui futuramente você chama seu backend Spring Boot:
      // const response = await fetch("http://localhost:8080/api/auth/login", { ... })
      router.replace("/(tabs)/home");
    } catch (error) {
      alert("Erro ao conectar. Verifique suas credenciais.");
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#0d1117] px-6">
      <View className="bg-[#161b22] rounded-2xl p-6">
        <Text className="text-3xl text-white font-bold text-center mb-6">Login</Text>

        <TextInput
          className="bg-[#0d1117] text-white border border-gray-600 rounded-xl p-4 mb-4"
          placeholder="Seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          className="bg-[#0d1117] text-white border border-gray-600 rounded-xl p-4 mb-4"
          placeholder="Sua senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => router.push("../auth/recover")}>
          <Text className="text-blue-400 text-right mb-4">Recuperar senha</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between">
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl flex-1 mr-2 items-center"
            onPress={handleLogin}
          >
            <Text className="text-white font-bold">Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-600 py-3 rounded-xl flex-1 ml-2 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-center mt-4">
          Ainda não tem conta?{" "}
          <Text
            className="text-blue-400"
            onPress={() => alert("Função de cadastro ainda não implementada!")}
          >
            Cadastre-se
          </Text>
        </Text>
      </View>
    </View>
  );
}
