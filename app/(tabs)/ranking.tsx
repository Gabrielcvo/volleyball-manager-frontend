import {
  formatInteger,
  formatNumber,
  formatPercentage,
} from "@/common/utils/formatters";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useEstatisticasGlobais } from "@/services/queries";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RankingScreen() {
  const [tabAtiva, setTabAtiva] = useState<"geral" | "destaques">("geral");

  // Usar React Query
  const {
    data: estatisticas,
    isLoading: loading,
    error,
    refetch,
  } = useEstatisticasGlobais();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderJogadorRanking = (jogador: any, posicao: number) => (
    <View key={jogador.id} style={styles.rankingItem}>
      <View style={styles.posicaoContainer}>
        <Text style={styles.posicaoText}>{posicao}</Text>
        {posicao <= 3 && (
          <MaterialIcons
            name="emoji-events"
            size={16}
            color={
              posicao === 1 ? "#FFD700" : posicao === 2 ? "#C0C0C0" : "#CD7F32"
            }
          />
        )}
      </View>

      <View style={styles.jogadorInfo}>
        <Text style={styles.jogadorNome}>{jogador.nome}</Text>
        {jogador.posicao_preferida && (
          <Text style={styles.jogadorPosicao}>{jogador.posicao_preferida}</Text>
        )}
      </View>

      <View style={styles.estatisticasContainer}>
        <Text style={styles.overallText}>{formatNumber(jogador.overall)}</Text>
        <Text style={styles.estatisticaText}>
          {formatInteger(jogador.total_partidas)} partidas
        </Text>
      </View>
    </View>
  );

  const renderDestaque = (destaque: any, tipo: string) => (
    <View key={`${tipo}-${destaque.jogador.id}`} style={styles.destaqueItem}>
      <View style={styles.destaqueHeader}>
        <MaterialIcons
          name={getDestaqueIcon(tipo)}
          size={24}
          color={Theme.colors.primary}
        />
        <Text style={styles.destaqueTipo}>{getDestaqueTitulo(tipo)}</Text>
      </View>

      <View style={styles.destaqueJogador}>
        <Text style={styles.destaqueNome}>{destaque.jogador.nome}</Text>
        <Text style={styles.destaqueValor}>
          {formatDestaqueValor(destaque.valor, tipo)}
        </Text>
      </View>
    </View>
  );

  const getDestaqueIcon = (tipo: string) => {
    switch (tipo) {
      case "maior_overall":
        return "star";
      case "mais_partidas":
        return "sports";
      case "maior_assiduidade":
        return "event-available";
      case "mais_vitorias":
        return "emoji-events";
      default:
        return "trending-up";
    }
  };

  const getDestaqueTitulo = (tipo: string) => {
    switch (tipo) {
      case "maior_overall":
        return "Maior Overall";
      case "mais_partidas":
        return "Mais Partidas";
      case "maior_assiduidade":
        return "Maior Assiduidade";
      case "mais_vitorias":
        return "Mais Vitórias";
      default:
        return "Destaque";
    }
  };

  const formatDestaqueValor = (valor: number, tipo: string) => {
    switch (tipo) {
      case "maior_overall":
        return formatNumber(valor);
      case "mais_partidas":
        return formatInteger(valor);
      case "maior_assiduidade":
        return formatPercentage(valor);
      case "mais_vitorias":
        return formatInteger(valor);
      default:
        return formatNumber(valor);
    }
  };

  if (loading && !estatisticas) {
    return (
      <ScreenLayout title="Ranking" showBackButton={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Ranking Global"
      showBackButton={false}
      scrollable={false}
    >
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, tabAtiva === "geral" && styles.tabAtiva]}
            onPress={() => setTabAtiva("geral")}
          >
            <Text
              style={[
                styles.tabText,
                tabAtiva === "geral" && styles.tabTextAtiva,
              ]}
            >
              Ranking Geral
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabAtiva === "destaques" && styles.tabAtiva]}
            onPress={() => setTabAtiva("destaques")}
          >
            <Text
              style={[
                styles.tabText,
                tabAtiva === "destaques" && styles.tabTextAtiva,
              ]}
            >
              Destaques
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
              tintColor={Theme.colors.primary}
            />
          }
        >
          {tabAtiva === "geral" ? (
            <View style={styles.rankingContainer}>
              {/* Estatísticas Gerais */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Estatísticas Globais</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatInteger(estatisticas?.total_jogadores || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Jogadores</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatInteger(estatisticas?.total_partidas || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Partidas</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatNumber(estatisticas?.overall_medio || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Overall Médio</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatPercentage(estatisticas?.assiduidade_media || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Assiduidade</Text>
                  </View>
                </View>
              </View>

              {/* Ranking de Jogadores */}
              <View style={styles.rankingSection}>
                <Text style={styles.sectionTitle}>Top Jogadores</Text>
                {(estatisticas?.ranking_jogadores || []).map((jogador, index) =>
                  renderJogadorRanking(jogador, index + 1)
                )}
              </View>
            </View>
          ) : (
            <View style={styles.destaquesContainer}>
              {/* Destaques */}
              {estatisticas?.destaques &&
                Object.entries(estatisticas.destaques).map(
                  ([tipo, destaque]) =>
                    destaque ? renderDestaque(destaque, tipo) : null
                )}
            </View>
          )}
        </ScrollView>
      </View>
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: "center",
  },
  tabAtiva: {
    backgroundColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "500",
    color: Theme.colors.text.secondary,
  },
  tabTextAtiva: {
    color: Theme.colors.text.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    marginTop: 0,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  statsTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  statValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  rankingContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  rankingSection: {
    margin: Theme.spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  posicaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 50,
    marginRight: Theme.spacing.md,
  },
  posicaoText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.primary,
    marginRight: Theme.spacing.xs,
  },
  jogadorInfo: {
    flex: 1,
  },
  jogadorNome: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  jogadorPosicao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
  },
  estatisticasContainer: {
    alignItems: "flex-end",
  },
  overallText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.status.success,
    marginBottom: 2,
  },
  estatisticaText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  destaquesContainer: {
    padding: Theme.spacing.lg,
    paddingTop: 0,
  },
  destaqueItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  destaqueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  destaqueTipo: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  destaqueJogador: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  destaqueNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  destaqueValor: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.primary,
  },
});
