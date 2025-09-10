import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import {
  useConfirmacoesPartida,
  useSortearTimes,
  useTimesPartida,
} from "@/services/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SortearTimesScreen() {
  const [numTimes, setNumTimes] = useState<number>(2);

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const partidaIdNumero = Number(partidaId);

  // React Query hooks
  const { data: confirmacoes, isLoading: confirmandoLoading } =
    useConfirmacoesPartida(partidaIdNumero);
  const { data: timesData, isLoading: timesLoading } =
    useTimesPartida(partidaIdNumero);
  const sortearTimesMutation = useSortearTimes();

  const times = timesData?.times || [];
  const loading = confirmandoLoading || timesLoading;

  const handleSortearTimes = async () => {
    if (!confirmacoes || !partidaId) return;

    try {
      const response = await sortearTimesMutation.mutateAsync({
        partidaId: partidaIdNumero,
        data: {
          metodo: "aleatorio",
          num_times: numTimes,
          jogadores_selecionados: confirmacoes.confirmados.map(
            (c) => c.jogador.id
          ),
        },
      });

      Alert.alert(
        "Sucesso",
        response.message || "Times sorteados com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao sortear times:", error);
      Alert.alert("Erro", "Não foi possível sortear os times.");
    }
  };

  const renderTime = (time: Time) => (
    <View
      key={time.id}
      className="bg-[#23262B] rounded-xl p-4 mb-3 border-l-4 border-l-[#2D6BFF]"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-white">{time.nome_time}</Text>
        <View className="items-end">
          <Text className="text-sm text-[#A0A4AB]">
            Overall: {time.overall_medio?.toFixed(1) || "N/A"}
          </Text>
          <Text className="text-sm text-[#A0A4AB]">
            {time.total_jogadores || time.jogadores?.length || 0} jogadores
          </Text>
        </View>
      </View>

      <View className="gap-2">
        {time.jogadores?.map((jogador) => (
          <View
            key={jogador.id}
            className="flex-row justify-between items-center p-2 bg-[#181B20] rounded-md"
          >
            <Text className="text-base font-medium text-white">
              {jogador.nome}
            </Text>
            <View className="flex-row items-center gap-2">
              {jogador.posicao_preferida && (
                <Text className="text-sm text-[#2D6BFF]">
                  {jogador.posicao_preferida}
                </Text>
              )}
              <Text className="text-sm text-[#A0A4AB] font-semibold">
                {jogador.overall?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Sortear Times" showBackButton scrollable={false}>
      <ScrollView className="flex-1 bg-[#181B20]">
        {/* Configurações de Sorteio */}
        <View className="bg-[#23262B] m-4 rounded-xl p-4">
          <Text className="text-lg font-bold text-white mb-3">
            Configurações do Sorteio
          </Text>

          {/* Método de Sorteio */}
          <Text className="text-base font-semibold text-white mb-2 mt-4">
            Método de Sorteio
          </Text>
          <View className="bg-[#181B20] p-3 rounded-lg border border-[#23262B] mb-2">
            <Text className="text-base font-semibold text-[#2D6BFF] mb-1">
              🎲 Sorteio Aleatório
            </Text>
            <Text className="text-sm text-[#A0A4AB] mb-3 italic">
              Os jogadores serão distribuídos aleatoriamente entre os times
            </Text>
          </View>

          {/* Seletor de Número de Times */}
          <Text className="text-base font-semibold text-white mb-2 mt-4">
            Número de Times
          </Text>
          <View className="flex-row gap-2 mb-2 flex-wrap">
            {Array.from(
              { length: Math.min(confirmacoes?.confirmados.length || 2, 6) },
              (_, i) => i + 2
            ).map((quantidade) => (
              <TouchableOpacity
                key={quantidade}
                className={`min-w-[50px] py-3 px-4 rounded-lg border-2 items-center justify-center ${
                  numTimes === quantidade
                    ? "border-[#2D6BFF] bg-[#2D6BFF20]"
                    : "border-[#23262B] bg-[#181B20]"
                }`}
                onPress={() => setNumTimes(quantidade)}
              >
                <Text
                  className={`text-base font-semibold ${
                    numTimes === quantidade
                      ? "text-[#2D6BFF]"
                      : "text-[#A0A4AB]"
                  }`}
                >
                  {quantidade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-sm text-[#A0A4AB] mb-3 italic">
            Máximo de {confirmacoes?.confirmados.length || 0} times (1 jogador
            por time)
          </Text>

          {/* Informações */}
          <View className="my-3">
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="group"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-2">
                {confirmacoes?.confirmados.length || 0} jogadores confirmados
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="sports"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-2">
                {numTimes} times serão formados
              </Text>
            </View>
          </View>

          {/* Botão de Sortear */}
          <TouchableOpacity
            className={`flex-row items-center justify-center bg-[#2D6BFF] py-4 rounded-lg gap-3 mt-3 ${
              sortearTimesMutation.isPending ? "opacity-60" : ""
            }`}
            onPress={handleSortearTimes}
            disabled={sortearTimesMutation.isPending || !confirmacoes}
          >
            {sortearTimesMutation.isPending ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <>
                <MaterialIcons
                  name="shuffle"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text className="text-base font-semibold text-white">
                  {times.length > 0 ? "Sortear Novamente" : "Sortear Times"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Times Sorteados */}
        {times.length > 0 && (
          <View className="m-4 mt-0">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-white">
                Times Sorteados
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-row items-center px-3 py-2 bg-[#181B20] rounded-md border border-[#2D6BFF] gap-1"
                  onPress={() =>
                    router.push({
                      pathname: "/screens/EditarTimes",
                      params: { partidaId: partidaId?.toString() },
                    })
                  }
                >
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color={Theme.colors.primary}
                  />
                  <Text className="text-sm font-semibold text-[#2D6BFF]">
                    Editar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {times.map((time) => renderTime(time))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
