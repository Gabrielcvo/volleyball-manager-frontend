import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useIniciarPelada } from "@/services/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Tela simplificada: apenas iniciar pelada

export default function InicializarJogosScreen() {
  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const partidaIdNumero = Number(partidaId);

  // React Query mutation
  const iniciarPeladaMutation = useIniciarPelada();

  const handleInicializar = async () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }

    try {
      const response = await iniciarPeladaMutation.mutateAsync(partidaIdNumero);
      Alert.alert("Pelada iniciada!", response.message || "", [
        {
          text: "Gerenciar Jogos",
          onPress: () =>
            router.replace(`/screens/GerenciarJogos?partidaId=${partidaId}`),
        },
      ]);
    } catch (error: any) {
      console.error("Erro ao iniciar pelada:", error);
      let mensagemErro = "Não foi possível iniciar a pelada.";
      if (error.response?.status === 403) {
        mensagemErro = "Apenas administradores podem iniciar a pelada.";
      } else if (error.response?.status === 409) {
        mensagemErro = "Já existe uma pelada em andamento.";
      }
      Alert.alert("Erro", mensagemErro);
    }
  };

  // (Fluxo antigo removido)

  return (
    <ScreenLayout title="Inicializar Jogos" showBackButton scrollable={false}>
      <ScrollView className="flex-1 bg-[#181B20]">
        <View className="bg-[#23262B] m-4 rounded-xl p-4">
          <Text className="text-lg font-bold text-white mb-3">
            Pelada Sequencial
          </Text>
          <Text className="text-base text-white ml-2">
            Inicie a pelada para esta partida. Você poderá criar jogos
            sequenciais escolhendo os times manualmente.
          </Text>
        </View>

        <View className="p-4">
          <TouchableOpacity
            className={`bg-[#2D6BFF] flex-row items-center justify-center py-3 rounded-lg gap-3 ${
              iniciarPeladaMutation.isPending ? "opacity-60" : ""
            }`}
            onPress={handleInicializar}
            disabled={iniciarPeladaMutation.isPending}
          >
            {iniciarPeladaMutation.isPending ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <>
                <MaterialIcons
                  name="play-arrow"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text className="text-base font-semibold text-white">
                  Iniciar Pelada
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
