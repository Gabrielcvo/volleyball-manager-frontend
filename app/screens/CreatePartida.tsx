import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useCreatePartida } from "@/services/queries";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreatePartidaScreen() {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("120");
  const [limiteJogadores, setLimiteJogadores] = useState("12");
  const [valorPelada, setValorPelada] = useState("0");

  const router = useRouter();
  const { groupId } = useLocalSearchParams();

  // Usar React Query mutation
  const createPartidaMutation = useCreatePartida();

  const parseDateTime = (dateStr: string, timeStr: string): Date | null => {
    try {
      // Esperamos formato dd/mm/yyyy para data e HH:MM para hora
      const dateParts = dateStr.split("/");
      const timeParts = timeStr.split(":");

      if (dateParts.length !== 3 || timeParts.length !== 2) {
        return null;
      }

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const year = parseInt(dateParts[2]);
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      const date = new Date(year, month, day, hours, minutes);

      // Verify if the date is valid
      if (
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  };

  const handleCreate = async () => {
    if (!groupId) {
      Alert.alert("Erro", "ID do grupo não encontrado");
      return;
    }

    if (!data.trim() || !hora.trim()) {
      Alert.alert("Erro", "Data e hora são obrigatórios");
      return;
    }

    const dataHora = parseDateTime(data.trim(), hora.trim());
    if (!dataHora) {
      Alert.alert(
        "Erro",
        "Data ou hora inválida. Use o formato dd/mm/yyyy para data e HH:MM para hora"
      );
      return;
    }

    const now = new Date();
    if (dataHora <= now) {
      Alert.alert("Erro", "A data e hora da partida deve ser no futuro");
      return;
    }

    try {
      const requestData = {
        data_hora: dataHora.toISOString(),
        ...(local.trim() && { local: local.trim() }),
        duracao_estimada_minutos: parseInt(duracaoMinutos) || 120,
        limite_jogadores: parseInt(limiteJogadores) || 12,
        valor_pelada: parseFloat(valorPelada) || 0,
      };

      // Usar mutation do React Query
      await createPartidaMutation.mutateAsync({
        grupoId: Number(groupId),
        data: requestData,
      });

      // A invalidação é automática!
      router.back();
    } catch (error) {
      console.error("Erro ao criar partida:", error);
    }
  };

  const handleCancel = () => {
    if (
      data ||
      hora ||
      local ||
      duracaoMinutos !== "120" ||
      limiteJogadores !== "12" ||
      valorPelada !== "0"
    ) {
      Alert.alert(
        "Cancelar criação",
        "Tem certeza que deseja cancelar? As informações não serão salvas.",
        [
          { text: "Continuar editando", style: "cancel" },
          {
            text: "Cancelar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const isFormValid = data.trim() !== "" && hora.trim() !== "";

  return (
    <ScreenLayout
      title="Criar Partida"
      showBackButton
      onBackPress={handleCancel}
      scrollable
      keyboardAvoiding
    >
      <View className="flex-1 p-4">
        <View className="flex-1">
          {/* Data */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Data *
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="dd/mm/yyyy"
              placeholderTextColor={Theme.colors.text.secondary}
              value={data}
              onChangeText={setData}
              maxLength={10}
            />
            <Text className="text-xs text-[#A0A4AB] mt-1 italic">
              Formato: dd/mm/yyyy (ex: 25/12/2024)
            </Text>
          </View>

          {/* Hora */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Hora *
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="HH:MM"
              placeholderTextColor={Theme.colors.text.secondary}
              value={hora}
              onChangeText={setHora}
              maxLength={5}
            />
            <Text className="text-xs text-[#A0A4AB] mt-1 italic">
              Formato: HH:MM (ex: 18:30)
            </Text>
          </View>

          {/* Local */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Local
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="Ex: Quadra da Praia"
              placeholderTextColor={Theme.colors.text.secondary}
              value={local}
              onChangeText={setLocal}
              autoCapitalize="words"
              maxLength={100}
            />
          </View>

          {/* Duração */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Duração (minutos)
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="120"
              placeholderTextColor={Theme.colors.text.secondary}
              value={duracaoMinutos}
              onChangeText={setDuracaoMinutos}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Limite de Jogadores */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Limite de Jogadores
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="12"
              placeholderTextColor={Theme.colors.text.secondary}
              value={limiteJogadores}
              onChangeText={setLimiteJogadores}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Valor da Pelada */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Valor da Pelada (R$)
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="0.00"
              placeholderTextColor={Theme.colors.text.secondary}
              value={valorPelada}
              onChangeText={setValorPelada}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>
        </View>

        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity
            className="flex-1 rounded-lg py-4 items-center border border-[#23262B]"
            onPress={handleCancel}
            disabled={createPartidaMutation.isPending}
          >
            <Text className="text-base font-semibold text-[#A0A4AB]">
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-lg py-4 items-center ${
              !isFormValid ? "bg-[#1a4bb8] opacity-60" : "bg-[#2D6BFF]"
            }`}
            onPress={handleCreate}
            disabled={!isFormValid || createPartidaMutation.isPending}
          >
            {createPartidaMutation.isPending ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <Text className="text-base font-semibold text-white">
                Criar Partida
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}
