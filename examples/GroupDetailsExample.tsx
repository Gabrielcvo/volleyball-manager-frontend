// EXEMPLO DE COMO USAR REACT QUERY EM UMA SCREEN COMPLEXA
// Este arquivo mostra como a GroupDetails seria refatorada

import { useAuth } from "@/app/context/authContext";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import {
  useGrupo,
  useGrupoMembros,
  useInvalidations,
  usePartidas,
  useRanking,
} from "@/hooks/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "partidas" | "membros" | "ranking";

export default function GroupDetailsExampleScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("partidas");

  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const { user } = useAuth();
  const invalidations = useInvalidations();

  const grupoId = groupId ? Number(groupId) : null;

  // ===== REACT QUERY HOOKS =====
  // Carrega dados do grupo
  const {
    data: grupo,
    isLoading: grupoLoading,
    error: grupoError,
    refetch: refetchGrupo,
  } = useGrupo(grupoId);

  // Carrega membros (só quando a tab estiver ativa)
  const {
    data: membros = [],
    isLoading: membrosLoading,
    error: membrosError,
  } = useGrupoMembros(activeTab === "membros" ? grupoId : null);

  // Carrega partidas (só quando a tab estiver ativa)
  const {
    data: partidas = [],
    isLoading: partidasLoading,
    error: partidasError,
  } = usePartidas(activeTab === "partidas" ? grupoId : null);

  // Carrega ranking (só quando a tab estiver ativa)
  const {
    data: rankingData,
    isLoading: rankingLoading,
    error: rankingError,
  } = useRanking(activeTab === "ranking" ? grupoId : null);

  // ===== COMPUTED VALUES =====
  const isLoading = grupoLoading;
  const hasError = grupoError || membrosError || partidasError || rankingError;

  const tabLoading =
    (activeTab === "membros" && membrosLoading) ||
    (activeTab === "partidas" && partidasLoading) ||
    (activeTab === "ranking" && rankingLoading);

  // ===== HANDLERS =====
  const handleCreatePartida = () => {
    router.push({
      pathname: "/screens/CreatePartida",
      params: { groupId: grupoId?.toString() },
    });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);

    // Pré-carrega dados da nova tab se necessário
    if (tab === "ranking" && grupoId) {
      invalidations.prefetchGrupoData(grupoId);
    }
  };

  const handleRefresh = () => {
    if (!grupoId) return;

    // Recarrega todos os dados do grupo
    invalidations.invalidateGrupo(grupoId);
  };

  // ===== RENDER FUNCTIONS =====
  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons
        name="error"
        size={64}
        color={Theme.colors.text.secondary}
      />
      <Text style={styles.errorText}>Erro ao carregar dados</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => refetchGrupo()}
      >
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    if (tabLoading) {
      return (
        <View style={styles.tabLoadingContainer}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
          <Text style={styles.tabLoadingText}>Carregando...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "partidas":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Partidas ({partidas.length})</Text>
            {partidas.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>
                  Nenhuma partida encontrada
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreatePartida}
                >
                  <Text style={styles.createButtonText}>Criar Partida</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Renderizar lista de partidas...
              <Text>Lista de partidas...</Text>
            )}
          </View>
        );

      case "membros":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Membros ({membros.length})</Text>
            {membros.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>
                  Nenhum membro encontrado
                </Text>
              </View>
            ) : (
              // Renderizar lista de membros...
              <Text>Lista de membros...</Text>
            )}
          </View>
        );

      case "ranking":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Ranking</Text>
            {!rankingData?.ranking || rankingData.ranking.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>
                  Ranking ainda não disponível
                </Text>
              </View>
            ) : (
              // Renderizar ranking...
              <Text>Ranking dos jogadores...</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // ===== MAIN RENDER =====
  if (isLoading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando grupo...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (hasError || !grupo) {
    return (
      <ScreenLayout title="Erro" showBackButton>
        {renderError()}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={grupo.nome} showBackButton>
      <ScrollView style={styles.container}>
        {/* Header com informações do grupo */}
        <View style={styles.header}>
          <Text style={styles.description}>{grupo.descricao}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{grupo.total_membros || 0}</Text>
              <Text style={styles.statLabel}>Membros</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{grupo.total_partidas || 0}</Text>
              <Text style={styles.statLabel}>Partidas</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["partidas", "membros", "ranking"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo da tab */}
        {renderTabContent()}
      </ScrollView>
    </ScreenLayout>
  );
}

// ===== STYLES =====
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
  loadingText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  errorText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  retryButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  header: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: "bold",
    color: Theme.colors.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    marginBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: "center",
    borderRadius: Theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: Theme.colors.text.primary,
    fontWeight: "600",
  },
  tabContent: {
    padding: Theme.spacing.lg,
  },
  tabTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  tabLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.xl,
  },
  tabLoadingText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
  },
  emptyTab: {
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyTabText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  createButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  createButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
});
