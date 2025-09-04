import { ScreenLayout } from "@/components/ScreenLayout";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScreenLayout title="Perfil" scrollable>
      <View className="flex-1 p-5">
        <View className="bg-[#23262B] rounded-2xl p-6 items-center mb-6">
          <Image
            source={require("@/assets/images/icon.png")}
            className="rounded-full mb-4"
            style={{ height: 80, width: 80 }}
          />
          <Text className="text-2xl font-bold text-white mb-1">
            {user?.nome || "Usuário"}
          </Text>
          <Text className="text-base text-[#A0A4AB]">
            {user?.email || "email@exemplo.com"}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-white mb-4">
            Estatísticas
          </Text>
          <View className="flex-row justify-between">
            <View className="bg-[#23262B] rounded-xl p-4 items-center flex-1 mx-1">
              <Text className="text-2xl font-bold text-[#2D6BFF] mb-1">12</Text>
              <Text className="text-xs text-[#A0A4AB] text-center">Jogos</Text>
            </View>
            <View className="bg-[#23262B] rounded-xl p-4 items-center flex-1 mx-1">
              <Text className="text-2xl font-bold text-[#2D6BFF] mb-1">8</Text>
              <Text className="text-xs text-[#A0A4AB] text-center">
                Vitórias
              </Text>
            </View>
            <View className="bg-[#23262B] rounded-xl p-4 items-center flex-1 mx-1">
              <Text className="text-2xl font-bold text-[#2D6BFF] mb-1">
                67%
              </Text>
              <Text className="text-xs text-[#A0A4AB] text-center">
                Taxa de Vitória
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-white mb-4">Ações</Text>
          <TouchableOpacity className="bg-[#23262B] rounded-xl p-4 mb-3">
            <Text className="text-white text-base font-medium">
              Editar Perfil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#23262B] rounded-xl p-4 mb-3">
            <Text className="text-white text-base font-medium">
              Histórico de Jogos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}
