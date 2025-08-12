import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useCreateGrupo } from "@/hooks/queries";
import { CreateGrupoRequest } from "@/services/api/grupos";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
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

  const router = useRouter();

  // Usando React Query para criar o grupo
  const createGrupoMutation = useCreateGrupo();

  const isFormValid = nome.trim() !== "";

  const handleCreate = async () => {
    if (!isFormValid) return;

    const data: CreateGrupoRequest = {
      nome: nome.trim(),
      ...(descricao.trim() && { descricao: descricao.trim() }),
      ...(localizacao.trim() && { localizacao: localizacao.trim() }),
      ...(regras.trim() && { regras: regras.trim() }),
    };

    createGrupoMutation.mutate(data, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        console.error("Erro ao criar grupo:", error);
        Alert.alert(
          "Erro",
          "Não foi possível criar o grupo. Tente novamente.",
          [{ text: "OK" }]
        );
      },
    });
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
      <View style={styles.container}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome do Grupo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Vôlei da Praia"
              placeholderTextColor={Theme.colors.text.secondary}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
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

          <View style={styles.field}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Praia de Copacabana - RJ"
              placeholderTextColor={Theme.colors.text.secondary}
              value={localizacao}
              onChangeText={setLocalizacao}
              autoCapitalize="words"
              maxLength={100}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Regras</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
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

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={createGrupoMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              (!isFormValid || createGrupoMutation.isPending) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!isFormValid || createGrupoMutation.isPending}
          >
            {createGrupoMutation.isPending ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <Text style={styles.createButtonText}>Criar Grupo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: Theme.spacing.xl,
  },
  label: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text.primary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    fontSize: Theme.fontSize.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cancelButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.secondary,
  },
  createButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.lg,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: Theme.colors.primaryDark,
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
});
