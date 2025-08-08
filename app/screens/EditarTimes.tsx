import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import TimesService, { Time } from "@/services/api/times";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
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
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedJogador, setSelectedJogador] = useState<JogadorTime | null>(
    null
  );
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const loadTimes = useCallback(async () => {
    if (!partidaId) return;

    try {
      setLoading(true);
      const response = await TimesService.listar(Number(partidaId));
      setTimes(response.times || []);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
      Alert.alert("Erro", "Não foi possível carregar os times da partida");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [partidaId, router]);

  useEffect(() => {
    loadTimes();
  }, [loadTimes]);

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

    setSaving(true);
    try {
      // Remover jogador do time atual
      const timeAtual = times.find((t) => t.id === selectedJogador.timeId);
      if (timeAtual) {
        const jogadoresAtualizados = (timeAtual.jogadores || []).filter(
          (j) => j.id !== selectedJogador.id
        );

        await TimesService.editar(selectedJogador.timeId, {
          jogadores: jogadoresAtualizados.map((j) => ({
            jogador_id: j.id,
            posicao_jogada: j.posicao_jogada || j.posicao_preferida,
          })),
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

        await TimesService.editar(novoTimeId, {
          jogadores: jogadoresNovos.map((j) => ({
            jogador_id: j.id,
            posicao_jogada: j.posicao_preferida,
          })),
        });
      }

      // Recarregar times
      await loadTimes();

      Alert.alert("Sucesso", "Jogador movido com sucesso!");
    } catch (error) {
      console.error("Erro ao mover jogador:", error);
      Alert.alert("Erro", "Não foi possível mover o jogador");
    } finally {
      setSaving(false);
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
    <View key={time.id} style={styles.timeCard}>
      <View style={styles.timeHeader}>
        <Text style={styles.timeNome}>{time.nome_time}</Text>
        <View style={styles.timeStats}>
          <Text style={styles.timeStat}>
            Overall: {calcularOverallMedio(time.jogadores || []).toFixed(1)}
          </Text>
          <Text style={styles.timeStat}>
            {(time.jogadores || []).length} jogadores
          </Text>
        </View>
      </View>

      <View style={styles.jogadoresList}>
        {(time.jogadores || []).map((jogador) => (
          <TouchableOpacity
            key={jogador.id}
            style={styles.jogadorItem}
            onPress={() => handleJogadorPress(jogador, time.id)}
          >
            <View style={styles.jogadorInfo}>
              <Text style={styles.jogadorNome}>{jogador.nome}</Text>
              {jogador.posicao_preferida && (
                <Text style={styles.jogadorPosicao}>
                  {jogador.posicao_preferida}
                </Text>
              )}
            </View>
            <View style={styles.jogadorStats}>
              <Text style={styles.jogadorOverall}>
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Mover {selectedJogador?.nome}</Text>
          <Text style={styles.modalSubtitle}>Escolha o time de destino:</Text>

          <View style={styles.timesSelector}>
            {times.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.timeSelectorItem,
                  time.id === selectedJogador?.timeId &&
                    styles.timeSelectorItemDisabled,
                ]}
                onPress={() => handleMoverJogador(time.id)}
                disabled={time.id === selectedJogador?.timeId || saving}
              >
                <Text
                  style={[
                    styles.timeSelectorText,
                    time.id === selectedJogador?.timeId &&
                      styles.timeSelectorTextDisabled,
                  ]}
                >
                  {time.nome_time}
                </Text>
                <Text style={styles.timeSelectorStats}>
                  {(time.jogadores || []).length} jogadores | Overall:{" "}
                  {calcularOverallMedio(time.jogadores || []).toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowTimeSelector(false)}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (times.length === 0) {
    return (
      <ScreenLayout title="Editar Times" showBackButton>
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="sports"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text style={styles.emptyTitle}>Nenhum time sorteado</Text>
          <Text style={styles.emptySubtitle}>
            É necessário sortear os times antes de editá-los
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Editar Times" showBackButton scrollable={false}>
      <ScrollView style={styles.container}>
        <View style={styles.instructionsCard}>
          <MaterialIcons name="info" size={24} color={Theme.colors.primary} />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Como editar</Text>
            <Text style={styles.instructionsSubtitle}>
              Toque em um jogador para movê-lo para outro time
            </Text>
          </View>
        </View>

        {times.map((time) => renderTime(time))}
      </ScrollView>

      {renderTimeSelectorModal()}

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.savingText}>Salvando alterações...</Text>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    textAlign: "center",
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  instructionsText: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  instructionsTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  instructionsSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  timeCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    marginTop: 0,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  timeNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  timeStats: {
    alignItems: "flex-end",
  },
  timeStat: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  jogadoresList: {
    gap: Theme.spacing.sm,
  },
  jogadorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  jogadorInfo: {
    flex: 1,
  },
  jogadorNome: {
    fontSize: Theme.fontSize.md,
    fontWeight: "500",
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  jogadorPosicao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
  },
  jogadorStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  jogadorOverall: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
  },
  timesSelector: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  timeSelectorItem: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  timeSelectorItemDisabled: {
    opacity: 0.5,
    borderColor: Theme.colors.text.secondary,
  },
  timeSelectorText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  timeSelectorTextDisabled: {
    color: Theme.colors.text.secondary,
  },
  timeSelectorStats: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  cancelButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.status.error,
    borderRadius: Theme.borderRadius.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  savingText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.md,
  },
});
