import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import {
  usePartidaConfirmacoes,
  usePartidaDetalhes,
  useSortearTimes,
  useTimes,
} from "@/hooks/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/authContext";

export default function SortearTimesScreen() {
  const [metodoSelecionado, setMetodoSelecionado] = useState<
    "overall" | "aleatorio" | "posicao"
  >("overall");

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();
  const { user } = useAuth();
  const partidaIdNum = Number(partidaId);
  const partidaIdValid =
    Number.isFinite(partidaIdNum) && partidaIdNum > 0 ? partidaIdNum : null;

  // Queries React Query
  const {
    data: partidaDetalhes,
    isLoading: detalhesLoading,
    error: detalhesError,
  } = usePartidaDetalhes(partidaIdValid);

  const {
    data: confirmacoes,
    isLoading: confirmacoesLoading,
    error: confirmacoesError,
  } = usePartidaConfirmacoes(partidaIdValid);

  const {
    data: timesData,
    isLoading: timesLoading,
    error: timesError,
  } = useTimes(partidaIdValid);

  const sortearTimesMutation = useSortearTimes();

  // Determinar loading e error states
  const isLoading = detalhesLoading || confirmacoesLoading || timesLoading;
  const hasError = detalhesError || confirmacoesError || timesError;

  // Extrair dados
  const times = timesData?.times || [];

  const handleSortearTimes = async () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não fornecido");
      return;
    }

    if (!confirmacoes?.confirmados || confirmacoes.confirmados.length < 2) {
      Alert.alert(
        "Erro",
        "É necessário pelo menos 2 jogadores confirmados para sortear times"
      );
      return;
    }

    try {
      await sortearTimesMutation.mutateAsync({
        partidaId: partidaIdNum,
        data: {
          metodo: metodoSelecionado,
          jogadores_selecionados: confirmacoes.confirmados.map(
            (j) => j.jogador.id
          ),
        },
      });

      Alert.alert("Sucesso", "Times sorteados com sucesso!");
      router.back();
    } catch (error) {
      console.error("Erro ao sortear times:", error);
      Alert.alert("Erro", "Não foi possível sortear os times");
    }
  };

  const getMetodoNome = (metodo: "overall" | "aleatorio" | "posicao") => {
    switch (metodo) {
      case "overall":
        return "Overall (Balanceado)";
      case "aleatorio":
        return "Aleatório";
      case "posicao":
        return "Por Posição";
      default:
        return metodo;
    }
  };

  const getMetodoDescricao = (metodo: "overall" | "aleatorio" | "posicao") => {
    switch (metodo) {
      case "overall":
        return "Distribui jogadores balanceando o overall médio dos times";
      case "aleatorio":
        return "Distribui jogadores de forma completamente aleatória";
      case "posicao":
        return "Distribui jogadores considerando suas posições preferenciais";
      default:
        return "";
    }
  };

  const renderTime = (time: any) => (
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
        {time.jogadores?.map((jogador: any) => (
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

  if (isLoading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (hasError) {
    return (
      <ScreenLayout title="Erro" showBackButton>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Ocorreu um erro ao carregar os dados da partida.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color={Theme.colors.primary}
            />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  if (!partidaDetalhes) {
    return (
      <ScreenLayout title="Partida não encontrada" showBackButton>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            A partida com ID {partidaId} não foi encontrada.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color={Theme.colors.primary}
            />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
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
          <View style={styles.metodosContainer}>
            {(
              ["overall", "aleatorio", "posicao"] as (
                | "overall"
                | "aleatorio"
                | "posicao"
              )[]
            ).map((metodo) => (
              <TouchableOpacity
                key={metodo}
                style={[
                  styles.metodoButton,
                  metodoSelecionado === metodo && styles.metodoButtonSelected,
                ]}
                onPress={() => setMetodoSelecionado(metodo)}
              >
                <Text
                  style={[
                    styles.metodoButtonText,
                    metodoSelecionado === metodo &&
                      styles.metodoButtonTextSelected,
                  ]}
                >
                  {getMetodoNome(metodo)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.metodoDescricao}>
            {getMetodoDescricao(metodoSelecionado)}
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
              <Text style={styles.infoText}>2 times serão formados</Text>
            </View>
          </View>

          {/* Botão de Sortear */}
          <TouchableOpacity
            style={[
              styles.sortearButton,
              sortearTimesMutation.isPending && styles.sortearButtonDisabled,
            ]}
            onPress={handleSortearTimes}
            disabled={
              sortearTimesMutation.isPending ||
              !confirmacoes ||
              confirmacoes.confirmados.length < 2
            }
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  errorText: {
    fontSize: Theme.fontSize.lg,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.primary + "10",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  backButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.sm,
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
  metodosContainer: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  metodoButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  metodoButtonSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + "20",
  },
  metodoButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "500",
    color: Theme.colors.text.secondary,
    textAlign: "center",
  },
  metodoButtonTextSelected: {
    color: Theme.colors.primary,
    fontWeight: "600",
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
});
