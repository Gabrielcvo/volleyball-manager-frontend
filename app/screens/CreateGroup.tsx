import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import GruposService, { CreateGrupoRequest } from "@/services/api/grupos";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateGroupScreen() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [regras, setRegras] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  const isFormValid = nome.trim() !== "";

  const handleCreate = async () => {
    if (!isFormValid) return;

    setCreating(true);
    try {
      const data: CreateGrupoRequest = {
        nome: nome.trim(),
        ...(descricao.trim() && { descricao: descricao.trim() }),
        ...(localizacao.trim() && { localizacao: localizacao.trim() }),
        ...(regras.trim() && { regras: regras.trim() }),
      };

      await GruposService.create(data);
      router.back();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    if (nome || descricao || localizacao || regras) {
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

  return (
    <ScreenLayout
      title="Criar Grupo"
      showBackButton
      onBackPress={handleCancel}
      scrollable
      keyboardAvoiding
    >
      <View className="flex-1 p-4">
        <View className="flex-1">
          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Nome do Grupo *
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="Ex: Vôlei da Praia"
              placeholderTextColor={Theme.colors.text.secondary}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Descrição
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B] min-h-[80px] text-top"
              placeholder="Descreva o grupo (opcional)"
              placeholderTextColor={Theme.colors.text.secondary}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Localização
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B]"
              placeholder="Ex: Praia de Copacabana - RJ"
              placeholderTextColor={Theme.colors.text.secondary}
              value={localizacao}
              onChangeText={setLocalizacao}
              autoCapitalize="words"
              maxLength={100}
            />
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-white mb-2">
              Regras
            </Text>
            <TextInput
              className="bg-[#23262B] text-white rounded-lg p-4 text-base border border-[#23262B] min-h-[80px] text-top"
              placeholder="Regras do grupo (opcional)"
              placeholderTextColor={Theme.colors.text.secondary}
              value={regras}
              onChangeText={setRegras}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </View>

        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity
            className="flex-1 rounded-lg py-4 items-center border border-[#23262B]"
            onPress={handleCancel}
            disabled={creating}
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
            disabled={!isFormValid || creating}
          >
            {creating ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <Text className="text-base font-semibold text-white">
                Criar Grupo
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}
