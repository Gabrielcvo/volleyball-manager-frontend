import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import TimesService, { Time } from "@/services/api/times";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PontuacaoScreen() {
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [pontuacoes, setPontuacoes] = useState<{ [timeId: number]: string }>(
    {}
  );

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const loadTimes = useCallback(async () => {
    if (!partidaId) return;

    try {
      setLoading(true);
      const response = await TimesService.listar(Number(partidaId));
      const timesData = response.times || [];

      setTimes(timesData);

      // Inicializar pontuações com valores atuais
      const pontosIniciais: { [timeId: number]: string } = {};
      timesData.forEach((time) => {
        pontosIniciais[time.id] = (time.pontuacao_final || 0).toString();
      });
      setPontuacoes(pontosIniciais);
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

  const handlePontuacaoChange = (timeId: number, valor: string) => {
    // Permitir apenas números
    const valorLimpo = valor.replace(/[^0-9]/g, "");
    setPontuacoes((prev) => ({
      ...prev,
      [timeId]: valorLimpo,
    }));
  };

  const handleSalvarPontuacao = async (timeId: number) => {
    const pontos = parseInt(pontuacoes[timeId] || "0");

    if (isNaN(pontos) || pontos < 0) {
      Alert.alert("Erro", "Digite uma pontuação válida");
      return;
    }

    setSaving(timeId);
    try {
      await TimesService.atualizarPontuacao(timeId, pontos);

      // Atualizar estado local
      setTimes((prev) =>
        prev.map((time) =>
          time.id === timeId ? { ...time, pontuacao_final: pontos } : time
        )
      );

      Alert.alert("Sucesso", "Pontuação atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar pontuação:", error);
      Alert.alert("Erro", "Não foi possível salvar a pontuação");
    } finally {
      setSaving(null);
    }
  };

  const handleIncrementar = (timeId: number) => {
    const pontoAtual = parseInt(pontuacoes[timeId] || "0");
    handlePontuacaoChange(timeId, (pontoAtual + 1).toString());
  };

  const handleDecrementar = (timeId: number) => {
    const pontoAtual = parseInt(pontuacoes[timeId] || "0");
    if (pontoAtual > 0) {
      handlePontuacaoChange(timeId, (pontoAtual - 1).toString());
    }
  };

  const getPontuacaoMudou = (timeId: number) => {
    const pontuacaoAtual =
      times.find((t) => t.id === timeId)?.pontuacao_final || 0;
    const pontuacaoNova = parseInt(pontuacoes[timeId] || "0");
    return pontuacaoAtual !== pontuacaoNova;
  };

  const getTimeVencedor = () => {
    const pontosMaximo = Math.max(...times.map((t) => t.pontuacao_final || 0));
    return times.find((t) => t.pontuacao_final === pontosMaximo);
  };

  const renderTime = (time: Time) => {
    const pontuacaoMudou = getPontuacaoMudou(time.id);
    const isSaving = saving === time.id;

    return (
      <View key={time.id} style={styles.timeCard}>
        <View style={styles.timeHeader}>
          <Text style={styles.timeNome}>{time.nome_time}</Text>
          <View style={styles.timeInfo}>
            <Text style={styles.timeJogadores}>
              {time.total_jogadores || time.jogadores?.length || 0} jogadores
            </Text>
            <Text style={styles.timeOverall}>
              Overall: {time.overall_medio?.toFixed(1) || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.pontuacaoContainer}>
          <Text style={styles.pontuacaoLabel}>Pontuação</Text>

          <View style={styles.pontuacaoControls}>
            <TouchableOpacity
              style={styles.decrementButton}
              onPress={() => handleDecrementar(time.id)}
              disabled={isSaving}
            >
              <MaterialIcons
                name="remove"
                size={20}
                color={Theme.colors.text.primary}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.pontuacaoInput}
              value={pontuacoes[time.id] || "0"}
              onChangeText={(valor) => handlePontuacaoChange(time.id, valor)}
              keyboardType="numeric"
              textAlign="center"
              editable={!isSaving}
            />

            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => handleIncrementar(time.id)}
              disabled={isSaving}
            >
              <MaterialIcons
                name="add"
                size={20}
                color={Theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {pontuacaoMudou && (
            <TouchableOpacity
              style={[
                styles.salvarButton,
                isSaving && styles.salvarButtonDisabled,
              ]}
              onPress={() => handleSalvarPontuacao(time.id)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={Theme.colors.text.primary}
                />
              ) : (
                <>
                  <MaterialIcons
                    name="save"
                    size={16}
                    color={Theme.colors.text.primary}
                  />
                  <Text style={styles.salvarButtonText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Jogadores */}
        <View style={styles.jogadoresList}>
          <Text style={styles.jogadoresTitle}>Jogadores:</Text>
          {(time.jogadores || []).map((jogador) => (
            <View key={jogador.id} style={styles.jogadorItem}>
              <Text style={styles.jogadorNome}>{jogador.nome}</Text>
              <View style={styles.jogadorStats}>
                {jogador.posicao_preferida && (
                  <Text style={styles.jogadorPosicao}>
                    {jogador.posicao_preferida}
                  </Text>
                )}
                <Text style={styles.jogadorOverall}>
                  {jogador.overall?.toFixed(1) || "N/A"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

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
      <ScreenLayout title="Pontuação" showBackButton>
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="score"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text style={styles.emptyTitle}>Nenhum time encontrado</Text>
          <Text style={styles.emptySubtitle}>
            É necessário sortear os times antes de gerenciar pontuações
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const timeVencedor = getTimeVencedor();
  const pontosMaximo = Math.max(...times.map((t) => t.pontuacao_final || 0));

  return (
    <ScreenLayout title="Pontuação" showBackButton scrollable={false}>
      <ScrollView style={styles.container}>
        {/* Resultado da Partida */}
        {pontosMaximo > 0 && (
          <View style={styles.resultadoCard}>
            <MaterialIcons
              name="emoji-events"
              size={32}
              color={Theme.colors.status.warning}
            />
            <View style={styles.resultadoInfo}>
              <Text style={styles.resultadoTitle}>Resultado Atual</Text>
              <Text style={styles.resultadoVencedor}>
                {timeVencedor?.nome_time} está vencendo
              </Text>
              <Text style={styles.resultadoPontos}>{pontosMaximo} pontos</Text>
            </View>
          </View>
        )}

        {/* Times e Pontuações */}
        {times.map((time) => renderTime(time))}

        {/* Instruções */}
        <View style={styles.instructionsCard}>
          <MaterialIcons name="info" size={24} color={Theme.colors.primary} />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Como usar</Text>
            <Text style={styles.instructionsSubtitle}>
              • Use +/- para ajustar rapidamente a pontuação{"\n"}• Digite
              diretamente no campo para valores específicos{"\n"}• Toque em
              &quot;Salvar&quot; para confirmar as alterações
            </Text>
          </View>
        </View>
      </ScrollView>
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
  resultadoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.status.warning,
  },
  resultadoInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  resultadoTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  resultadoVencedor: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.status.warning,
    marginBottom: 2,
  },
  resultadoPontos: {
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
  timeInfo: {
    alignItems: "flex-end",
  },
  timeJogadores: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  timeOverall: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  pontuacaoContainer: {
    marginBottom: Theme.spacing.md,
  },
  pontuacaoLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  pontuacaoControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  decrementButton: {
    backgroundColor: Theme.colors.status.error,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  incrementButton: {
    backgroundColor: Theme.colors.status.success,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  pontuacaoInput: {
    backgroundColor: Theme.colors.background,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    minWidth: 80,
  },
  salvarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
    alignSelf: "center",
  },
  salvarButtonDisabled: {
    opacity: 0.6,
  },
  salvarButtonText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  jogadoresList: {
    marginTop: Theme.spacing.sm,
  },
  jogadoresTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  jogadorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  jogadorNome: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  jogadorStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  jogadorPosicao: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.primary,
  },
  jogadorOverall: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
    fontWeight: "600",
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginBottom: Theme.spacing.xs,
  },
  instructionsSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
  },
});
