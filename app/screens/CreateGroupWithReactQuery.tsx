import { ScreenLayout } from "@/components/ScreenLayout";
import { useCreateGrupo } from "@/services/queries";
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

/**
 * Exemplo de componente migrado para usar React Query
 * Comparar com CreateGroup.tsx original
 */
export default function CreateGroupWithReactQueryScreen() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [regras, setRegras] = useState("");

  const router = useRouter();

  // Usar React Query mutation
  const createGrupoMutation = useCreateGrupo();

  const isFormValid = nome.trim() !== "";

  const handleCreate = async () => {
    if (!isFormValid) return;

    try {
      const data = {
        nome: nome.trim(),
        ...(descricao.trim() && { descricao: descricao.trim() }),
        ...(localizacao.trim() && { localizacao: localizacao.trim() }),
        ...(regras.trim() && { regras: regras.trim() }),
      };

      // Usar mutation do React Query
      await createGrupoMutation.mutateAsync(data);

      // A invalidação da lista de grupos é automática!
      router.back();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      // O erro já é tratado pelo interceptor do axios
    }
  };

  const handleCancel = () => {
    if (nome || descricao || localizacao || regras) {
      Alert.alert(
        "Cancelar criação",
        "Tem certeza que deseja cancelar? Os dados preenchidos serão perdidos.",
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
    <ScreenLayout>
      <View className="flex-1 bg-white px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Criar Novo Grupo
        </Text>
        <Text className="text-gray-600 mb-8">
          Crie um grupo para organizar suas peladas de vôlei
        </Text>

        <View className="space-y-6">
          {/* Nome do Grupo */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome do Grupo *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Ex: Pelada do Bairro"
              value={nome}
              onChangeText={setNome}
              maxLength={100}
            />
          </View>

          {/* Descrição */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Descrição
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Descreva o grupo..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Localização */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Localização
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Ex: Quadra do Clube, Rua das Flores, 123"
              value={localizacao}
              onChangeText={setLocalizacao}
              maxLength={200}
            />
          </View>

          {/* Regras */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Regras
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Regras específicas do grupo..."
              value={regras}
              onChangeText={setRegras}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>
        </View>

        {/* Botões */}
        <View className="flex-row space-x-4 mt-8">
          <TouchableOpacity
            className="flex-1 bg-gray-200 rounded-lg py-4 items-center"
            onPress={handleCancel}
            disabled={createGrupoMutation.isPending}
          >
            <Text className="text-gray-700 font-medium">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-lg py-4 items-center ${
              isFormValid && !createGrupoMutation.isPending
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
            onPress={handleCreate}
            disabled={!isFormValid || createGrupoMutation.isPending}
          >
            {createGrupoMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium">Criar Grupo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Mostrar erro se houver */}
        {createGrupoMutation.error && (
          <View className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-sm">
              Erro ao criar grupo. Tente novamente.
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
