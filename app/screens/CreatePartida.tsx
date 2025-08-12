import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useCreatePartida } from "@/hooks/queries";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function CreatePartidaScreen() {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("120");
  const [limiteJogadores, setLimiteJogadores] = useState("12");
  const [valorPelada, setValorPelada] = useState("0");

  const router = useRouter();
  const { groupId } = useLocalSearchParams();
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
    } catch (error) {
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

    const requestData = {
      data_hora: dataHora.toISOString(),
      ...(local.trim() && { local: local.trim() }),
      duracao_estimada_minutos: parseInt(duracaoMinutos) || 120,
      limite_jogadores: parseInt(limiteJogadores) || 12,
      valor_pelada: parseFloat(valorPelada) || 0,
    };

    createPartidaMutation.mutate(
      {
        grupoId: Number(groupId),
        data: requestData,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          console.error("Erro ao criar partida:", error);
          Alert.alert("Erro", "Não foi possível criar a partida");
        },
      }
    );
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
      <View style={styles.container}>
        <View style={styles.form}>
          {/* Data */}
          <View style={styles.field}>
            <Text style={styles.label}>Data *</Text>
            <TextInput
              style={styles.input}
              placeholder="dd/mm/yyyy"
              placeholderTextColor={Theme.colors.text.secondary}
              value={data}
              onChangeText={setData}
              maxLength={10}
            />
            <Text style={styles.hint}>
              Formato: dd/mm/yyyy (ex: 25/12/2024)
            </Text>
          </View>

          {/* Hora */}
          <View style={styles.field}>
            <Text style={styles.label}>Hora *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={Theme.colors.text.secondary}
              value={hora}
              onChangeText={setHora}
              maxLength={5}
            />
            <Text style={styles.hint}>Formato: HH:MM (ex: 18:30)</Text>
          </View>

          {/* Local */}
          <View style={styles.field}>
            <Text style={styles.label}>Local</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Quadra da Praia"
              placeholderTextColor={Theme.colors.text.secondary}
              value={local}
              onChangeText={setLocal}
              autoCapitalize="words"
              maxLength={100}
            />
          </View>

          {/* Duração */}
          <View style={styles.field}>
            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="120"
              placeholderTextColor={Theme.colors.text.secondary}
              value={duracaoMinutos}
              onChangeText={setDuracaoMinutos}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Limite de Jogadores */}
          <View style={styles.field}>
            <Text style={styles.label}>Limite de Jogadores</Text>
            <TextInput
              style={styles.input}
              placeholder="12"
              placeholderTextColor={Theme.colors.text.secondary}
              value={limiteJogadores}
              onChangeText={setLimiteJogadores}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Valor da Pelada */}
          <View style={styles.field}>
            <Text style={styles.label}>Valor da Pelada (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Theme.colors.text.secondary}
              value={valorPelada}
              onChangeText={setValorPelada}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={createPartidaMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              !isFormValid && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!isFormValid || createPartidaMutation.isPending}
          >
            {createPartidaMutation.isPending ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <Text style={styles.createButtonText}>Criar Partida</Text>
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
  hint: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    fontStyle: "italic",
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
