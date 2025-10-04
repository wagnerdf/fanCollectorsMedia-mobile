import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-[#0d1117] px-6">
      <Image
        source={require("../../assets/fans.png")} // imagem da galera
        className="w-48 h-48 mb-6"
        resizeMode="contain"
      />

      <Text className="text-2xl font-bold text-white mb-3 text-center">
        Bem-vindo ao FanCollectorsMedia
      </Text>
      <Text className="text-gray-300 text-center mb-8">
        Conecte-se com fãs como você, compartilhe sua coleção e descubra novas mídias para amar.
      </Text>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="bg-blue-600 px-5 py-3 rounded-xl"
          onPress={() => router.push("/auth/login")}
        >
          <Text className="text-white font-bold">Logar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-600 px-5 py-3 rounded-xl"
          onPress={() => alert("Função de cadastro ainda não implementada!")}
        >
          <Text className="text-white font-bold">Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
