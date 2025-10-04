import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleRecover = () => {
    if (!email) {
      alert("Digite seu email!");
      return;
    }
    alert("Link de recuperação enviado!");
  };

  return (
    <View className="flex-1 justify-center bg-[#0d1117] px-6">
      <View className="bg-[#161b22] rounded-2xl p-6">
        <Text className="text-3xl text-white font-bold text-center mb-6">
          Recuperar senha
        </Text>

        <TextInput
          className="bg-[#0d1117] text-white border border-gray-600 rounded-xl p-4 mb-4"
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View className="flex-row justify-between">
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl flex-1 mr-2 items-center"
            onPress={handleRecover}
          >
            <Text className="text-white font-bold">Enviar link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-600 py-3 rounded-xl flex-1 ml-2 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
