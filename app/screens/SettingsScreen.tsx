import { ScreenLayout } from "@/components/ScreenLayout";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/auth/login");
  }

  return (
    <ScreenLayout title="Configurações" scrollable>
      <View className="flex-1 p-5">
        <View className="mb-4">
          <Text className="text-[#A0A4AB] text-[13px] mb-1 font-semibold">
            Conta
          </Text>
          <TouchableOpacity className="flex-row items-center bg-[#23262B] rounded-lg p-3.5 mb-2">
            <Image
              source={require("@/assets/images/icon.png")}
              className="rounded-full mr-3"
              style={{ height: 36, width: 36 }}
            />
            <View className="flex-1">
              <Text className="text-white text-[15px] font-bold">Perfil</Text>
              <Text className="text-[#A0A4AB] text-[13px]">
                Editar informações pessoais
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-[#A0A4AB] text-[13px] mb-1 font-semibold">
            Notificações
          </Text>
          <TouchableOpacity className="flex-row items-center bg-[#23262B] rounded-lg p-3.5 mb-2">
            <Text className="text-white text-[15px] flex-1">Notificações</Text>
            <Text className="text-[#A0A4AB] text-lg ml-2">→</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-[#A0A4AB] text-[13px] mb-1 font-semibold">
            Preferências
          </Text>
          <View className="flex-row items-center bg-[#23262B] rounded-lg p-3.5 mb-2">
            <Text className="text-white text-[15px] flex-1">
              Raio de distância
            </Text>
            <Text className="text-white text-[15px] font-bold">10 km</Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[#A0A4AB] text-[13px] mb-1 font-semibold">
            Sobre
          </Text>
          <TouchableOpacity className="flex-row items-center bg-[#23262B] rounded-lg p-3.5 mb-2">
            <Text className="text-white text-[15px] flex-1">Termos de uso</Text>
            <Text className="text-[#A0A4AB] text-lg ml-2">→</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-[#23262B] rounded-lg p-3.5 mb-2">
            <Text className="text-white text-[15px] flex-1">
              Política de privacidade
            </Text>
            <Text className="text-[#A0A4AB] text-lg ml-2">→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-[#dc3545] rounded-3xl py-4 items-center mt-auto mb-6"
          onPress={handleLogout}
        >
          <Text className="text-white text-base font-bold">Sair</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}
