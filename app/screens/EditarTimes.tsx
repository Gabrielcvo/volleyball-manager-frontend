import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useEditarTime, useTimesPartida } from "@/services/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface JogadorTime {
  id: number;
  nome: string;
  posicao_preferida?: string;
  overall: number;
  avatar_url?: string;
  timeId: number;
}

export default function EditarTimesScreen() {
  const [selectedJogador, setSelectedJogador] = useState<JogadorTime | null>(
    null
  );
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const partidaIdNumero = Number(partidaId);

  // React Query hooks
  const { data: timesData, isLoading: loading } =
    useTimesPartida(partidaIdNumero);
  const editarTimeMutation = useEditarTime();

  const times = timesData?.times || [];

  const handleJogadorPress = (jogador: any, timeId: number) => {
    const jogadorTime: JogadorTime = {
      id: jogador.id,
      nome: jogador.nome,
      posicao_preferida: jogador.posicao_preferida,
      overall: jogador.overall,
      avatar_url: jogador.avatar_url,
      timeId: timeId,
    };
    setSelectedJogador(jogadorTime);
    setShowTimeSelector(true);
  };

  const handleMoverJogador = async (novoTimeId: number) => {
    if (!selectedJogador || selectedJogador.timeId === novoTimeId) {
      setShowTimeSelector(false);
      setSelectedJogador(null);
      return;
    }

    try {
      // Remover jogador do time atual
      const timeAtual = times.find((t) => t.id === selectedJogador.timeId);
      if (timeAtual) {
        const jogadoresAtualizados = (timeAtual.jogadores || []).filter(
          (j) => j.id !== selectedJogador.id
        );

        await editarTimeMutation.mutateAsync({
          timeId: selectedJogador.timeId,
          data: {
            jogadores: jogadoresAtualizados.map((j) => ({
              jogador_id: j.id,
              posicao_jogada: j.posicao_jogada || j.posicao_preferida,
            })),
          },
        });
      }

      // Adicionar jogador ao novo time
      const novoTime = times.find((t) => t.id === novoTimeId);
      if (novoTime) {
        const jogadoresNovos = [
          ...(novoTime.jogadores || []),
          {
            id: selectedJogador.id,
            nome: selectedJogador.nome,
            posicao_preferida: selectedJogador.posicao_preferida,
            overall: selectedJogador.overall,
            avatar_url: selectedJogador.avatar_url,
          },
        ];

        await editarTimeMutation.mutateAsync({
          timeId: novoTimeId,
          data: {
            jogadores: jogadoresNovos.map((j) => ({
              jogador_id: j.id,
              posicao_jogada: j.posicao_preferida,
            })),
          },
        });
      }

      Alert.alert("Sucesso", "Jogador movido com sucesso!");
    } catch (error) {
      console.error("Erro ao mover jogador:", error);
      Alert.alert("Erro", "Não foi possível mover o jogador");
    } finally {
      setShowTimeSelector(false);
      setSelectedJogador(null);
    }
  };

  const calcularOverallMedio = (jogadores: any[]) => {
    if (!jogadores || jogadores.length === 0) return 0;
    const soma = jogadores.reduce((acc, j) => acc + (j.overall || 0), 0);
    return soma / jogadores.length;
  };

  const renderTime = (time: Time) => (
    <View
      key={time.id}
      className="bg-[#23262B] m-4 mt-0 rounded-xl p-4 border-l-4 border-l-[#2D6BFF]"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-white">{time.nome_time}</Text>
        <View className="items-end">
          <Text className="text-sm text-[#A0A4AB]">
            Overall: {calcularOverallMedio(time.jogadores || []).toFixed(1)}
          </Text>
          <Text className="text-sm text-[#A0A4AB]">
            {(time.jogadores || []).length} jogadores
          </Text>
        </View>
      </View>

      <View className="gap-2">
        {(time.jogadores || []).map((jogador) => (
          <TouchableOpacity
            key={jogador.id}
            className="flex-row justify-between items-center p-3 bg-[#181B20] rounded-md border border-[#23262B]"
            onPress={() => handleJogadorPress(jogador, time.id)}
          >
            <View className="flex-1">
              <Text className="text-base font-medium text-white mb-0.5">
                {jogador.nome}
              </Text>
              {jogador.posicao_preferida && (
                <Text className="text-sm text-[#2D6BFF]">
                  {jogador.posicao_preferida}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-[#A0A4AB] font-semibold">
                {jogador.overall?.toFixed(1) || "N/A"}
              </Text>
              <MaterialIcons
                name="swap-horiz"
                size={16}
                color={Theme.colors.text.secondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeSelectorModal = () => (
    <Modal
      visible={showTimeSelector}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTimeSelector(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-[#23262B] rounded-xl p-6 w-full max-w-[400px]">
          <Text className="text-lg font-bold text-white text-center mb-2">
            Mover {selectedJogador?.nome}
          </Text>
          <Text className="text-base text-[#A0A4AB] text-center mb-4">
            Escolha o time de destino:
          </Text>

          <View className="gap-2 mb-4">
            {times.map((time) => (
              <TouchableOpacity
                key={time.id}
                className={`p-3 bg-[#181B20] rounded-md border-2 ${
                  time.id === selectedJogador?.timeId
                    ? "opacity-50 border-[#A0A4AB]"
                    : "border-[#23262B]"
                }`}
                onPress={() => handleMoverJogador(time.id)}
                disabled={
                  time.id === selectedJogador?.timeId ||
                  editarTimeMutation.isPending
                }
              >
                <Text
                  className={`text-base font-semibold mb-0.5 ${
                    time.id === selectedJogador?.timeId
                      ? "text-[#A0A4AB]"
                      : "text-white"
                  }`}
                >
                  {time.nome_time}
                </Text>
                <Text className="text-sm text-[#A0A4AB]">
                  {(time.jogadores || []).length} jogadores | Overall:{" "}
                  {calcularOverallMedio(time.jogadores || []).toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="py-3 px-4 bg-[#dc3545] rounded-md items-center"
            onPress={() => setShowTimeSelector(false)}
            disabled={editarTimeMutation.isPending}
          >
            <Text className="text-base font-semibold text-white">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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

  if (times.length === 0) {
    return (
      <ScreenLayout title="Editar Times" showBackButton>
        <View className="flex-1 justify-center items-center p-5">
          <MaterialIcons
            name="sports"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text className="text-lg font-bold text-white mt-3 mb-2">
            Nenhum time sorteado
          </Text>
          <Text className="text-base text-[#A0A4AB] text-center">
            É necessário sortear os times antes de editá-los
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Editar Times" showBackButton scrollable={false}>
      <ScrollView className="flex-1 bg-[#181B20]">
        <View className="flex-row items-center bg-[#23262B] m-4 p-4 rounded-xl border-l-4 border-l-[#2D6BFF]">
          <MaterialIcons name="info" size={24} color={Theme.colors.primary} />
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-white mb-0.5">
              Como editar
            </Text>
            <Text className="text-sm text-[#A0A4AB]">
              Toque em um jogador para movê-lo para outro time
            </Text>
          </View>
        </View>

        {times.map((time) => renderTime(time))}
      </ScrollView>

      {renderTimeSelectorModal()}

      {editarTimeMutation.isPending && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center">
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text className="text-base text-white mt-3">
            Salvando alterações...
          </Text>
        </View>
      )}
    </ScreenLayout>
  );
}
