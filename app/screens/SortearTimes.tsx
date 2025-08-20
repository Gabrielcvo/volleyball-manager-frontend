import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import PartidasService, { ConfirmacoesPartida } from "@/services/api/partidas";
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
  TouchableOpacity,
  View,
} from "react-native";

export default function SortearTimesScreen() {
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacoesPartida | null>(
    null
  );
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [numTimes, setNumTimes] = useState<number>(2);

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const loadData = useCallback(async () => {
    if (!partidaId) {
      console.log("Erro: ID da partida não foi fornecido");
      router.back();
      return;
    }

    const partidaIdNumero = Number(partidaId);
    if (isNaN(partidaIdNumero) || partidaIdNumero <= 0) {
      console.log("Erro: ID da partida inválido");
      router.back();
      return;
    }

    try {
      setLoading(true);

      // Carregar confirmações da partida
      const confirmacaoResponse = await PartidasService.getConfirmacoes(
        partidaIdNumero
      );

      if (!confirmacaoResponse || !confirmacaoResponse.partida) {
        console.log("Erro: Resposta inválida do servidor (confirmações)");
        throw new Error("Resposta inválida do servidor");
      }

      setConfirmacoes(confirmacaoResponse);

      // Tentar carregar times existentes
      try {
        const timesResponse = await TimesService.listar(partidaIdNumero);
        setTimes(timesResponse.times || []);
      } catch (error) {
        // Se não há times ainda, não é erro
        console.log("Nenhum time encontrado para a partida");
        setTimes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [partidaId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSortearTimes = async () => {
    if (!confirmacoes || !partidaId) return;

    setSorteando(true);
    try {
      const response = await TimesService.sortear(Number(partidaId), {
        metodo: "aleatorio",
        num_times: numTimes,
        jogadores_selecionados: confirmacoes.confirmados.map(
          (c) => c.jogador.id
        ),
      });

      setTimes(response.times);
      Alert.alert(
        "Sucesso",
        response.message || "Times sorteados com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao sortear times:", error);
      Alert.alert("Erro", "Não foi possível sortear os times.");
    } finally {
      setSorteando(false);
    }
  };

  const renderTime = (time: Time) => (
    <View key={time.id} style={styles.timeCard}>
      <View style={styles.timeHeader}>
        <Text style={styles.timeNome}>{time.nome_time}</Text>
        <View style={styles.timeStats}>
          <Text style={styles.timeStat}>
            Overall: {time.overall_medio?.toFixed(1) || "N/A"}
          </Text>
          <Text style={styles.timeStat}>
            {time.total_jogadores || time.jogadores?.length || 0} jogadores
          </Text>
        </View>
      </View>

      <View style={styles.jogadoresList}>
        {time.jogadores?.map((jogador) => (
          <View key={jogador.id} style={styles.jogadorItem}>
            <Text style={styles.jogadorNome}>{jogador.nome}</Text>
            <View style={styles.jogadorInfo}>
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

  if (loading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Sortear Times" showBackButton scrollable={false}>
      <ScrollView style={styles.container}>
        {/* Configurações de Sorteio */}
        <View style={styles.configCard}>
          <Text style={styles.sectionTitle}>Configurações do Sorteio</Text>

          {/* Método de Sorteio */}
          <Text style={styles.configLabel}>Método de Sorteio</Text>
          <View style={styles.metodoInfo}>
            <Text style={styles.metodoAtivo}>🎲 Sorteio Aleatório</Text>
            <Text style={styles.metodoDescricao}>
              Os jogadores serão distribuídos aleatoriamente entre os times
            </Text>
          </View>

          {/* Seletor de Número de Times */}
          <Text style={styles.configLabel}>Número de Times</Text>
          <View style={styles.timesQuantityContainer}>
            {Array.from(
              { length: Math.min(confirmacoes?.confirmados.length || 2, 6) },
              (_, i) => i + 2
            ).map((quantidade) => (
              <TouchableOpacity
                key={quantidade}
                style={[
                  styles.quantityButton,
                  numTimes === quantidade && styles.quantityButtonSelected,
                ]}
                onPress={() => setNumTimes(quantidade)}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    numTimes === quantidade &&
                      styles.quantityButtonTextSelected,
                  ]}
                >
                  {quantidade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.quantityDescription}>
            Máximo de {confirmacoes?.confirmados.length || 0} times (1 jogador
            por time)
          </Text>

          {/* Informações */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="group"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.infoText}>
                {confirmacoes?.confirmados.length || 0} jogadores confirmados
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="sports"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.infoText}>
                {numTimes} times serão formados
              </Text>
            </View>
          </View>

          {/* Botão de Sortear */}
          <TouchableOpacity
            style={[
              styles.sortearButton,
              sorteando && styles.sortearButtonDisabled,
            ]}
            onPress={handleSortearTimes}
            disabled={sorteando || !confirmacoes}
          >
            {sorteando ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <>
                <MaterialIcons
                  name="shuffle"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text style={styles.sortearButtonText}>
                  {times.length > 0 ? "Sortear Novamente" : "Sortear Times"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Times Sorteados */}
        {times.length > 0 && (
          <View style={styles.timesContainer}>
            <View style={styles.timesHeader}>
              <Text style={styles.sectionTitle}>Times Sorteados</Text>
              <View style={styles.timesActions}>
                <TouchableOpacity
                  style={styles.actionButton}
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
                  <Text style={styles.actionButtonText}>Editar</Text>
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
  configCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  configLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  metodoInfo: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  metodoAtivo: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  metodoDescricao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
    fontStyle: "italic",
  },
  infoContainer: {
    marginVertical: Theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  infoText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  sortearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  sortearButtonDisabled: {
    opacity: 0.6,
  },
  sortearButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  timesContainer: {
    margin: Theme.spacing.lg,
    marginTop: 0,
  },
  timeCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
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
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
  },
  jogadorNome: {
    fontSize: Theme.fontSize.md,
    fontWeight: "500",
    color: Theme.colors.text.primary,
  },
  jogadorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  jogadorPosicao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
  },
  jogadorOverall: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    fontWeight: "600",
  },
  timesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  timesActions: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    gap: Theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.primary,
  },
  timesQuantityContainer: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    flexWrap: "wrap",
  },
  quantityButton: {
    minWidth: 50,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + "20",
  },
  quantityButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.secondary,
  },
  quantityButtonTextSelected: {
    color: Theme.colors.primary,
  },
  quantityDescription: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
    fontStyle: "italic",
  },
});
