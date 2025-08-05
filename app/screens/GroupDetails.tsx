import {
  formatDate,
  formatInteger,
  formatNumber,
  formatPercentage,
} from "@/common/utils/formatters";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import GruposService, { Grupo, MembroGrupo } from "@/services/api/grupos";
import PartidasService, { Partida } from "@/services/api/partidas";
import RankingService, { JogadorRanking } from "@/services/api/ranking";
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
import { useAuth } from "../context/authContext";

type Tab = "partidas" | "membros" | "ranking";

export default function GroupDetailsScreen() {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("partidas");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Tab data
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [membros, setMembros] = useState<MembroGrupo[]>([]);
  const [ranking, setRanking] = useState<JogadorRanking[]>([]);

  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const { user } = useAuth();

  const loadGrupoDetails = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await GruposService.getById(Number(groupId));
      setGrupo(response.grupo);
    } catch (error) {
      console.error("Erro ao carregar grupo:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do grupo");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [groupId, router]);

  const loadTabData = useCallback(
    async (tab: Tab) => {
      if (!groupId) return;

      try {
        setTabLoading(true);

        switch (tab) {
          case "partidas":
            const partidasResponse = await PartidasService.list(
              Number(groupId)
            );
            setPartidas(partidasResponse.partidas);
            break;
          case "membros":
            const membrosResponse = await GruposService.getMembros(
              Number(groupId)
            );
            setMembros(membrosResponse.membros);
            break;
          case "ranking":
            const rankingResponse = await RankingService.getRanking(
              Number(groupId)
            );
            setRanking(rankingResponse.ranking);
            break;
        }
      } catch (error) {
        console.error(`Erro ao carregar ${tab}:`, error);
      } finally {
        setTabLoading(false);
      }
    },
    [groupId]
  );

  useEffect(() => {
    loadGrupoDetails();
  }, [loadGrupoDetails]);

  useEffect(() => {
    if (grupo) {
      loadTabData(activeTab);
    }
  }, [loadTabData, activeTab, grupo]);

  // Recarregar dados quando voltar para a tela (simplificado)
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (grupo) {
      loadTabData(activeTab);
    }
  }, [refreshKey]); // Recarrega quando refreshKey muda

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleCreatePartida = async () => {
    router.push({
      pathname: "/screens/CreatePartida",
      params: { groupId: groupId?.toString() },
    });

    // Força reload quando voltar (hack simples)
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, 1000);
  };

  const handlePartidaPress = (partida: Partida) => {
    router.push({
      pathname: "/screens/PartidaDetails",
      params: { partidaId: partida.id.toString() },
    });
  };

  const isAdmin = grupo?.meu_papel === "admin";

  const renderPartidas = () => (
    <View style={styles.tabContent}>
      {partidas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="sports-volleyball"
            size={48}
            color={Theme.colors.text.secondary}
          />
          <Text style={styles.emptyText}>Nenhuma partida criada ainda</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreatePartida}
            >
              <Text style={styles.emptyButtonText}>Criar Primeira Partida</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        partidas.map((partida) => (
          <TouchableOpacity
            key={partida.id}
            style={styles.partidaItem}
            onPress={() => handlePartidaPress(partida)}
          >
            <View style={styles.partidaInfo}>
              <Text style={styles.partidaData}>
                {formatDate(partida.data_hora)}
              </Text>
              {partida.local && (
                <Text style={styles.partidaLocal}>{partida.local}</Text>
              )}
              <View style={styles.partidaStats}>
                <Text style={styles.partidaStat}>
                  {partida.confirmados || 0}/{partida.limite_jogadores}{" "}
                  confirmados
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(partida.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(partida.status)}
                  </Text>
                </View>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={Theme.colors.text.secondary}
            />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderMembros = () => (
    <View style={styles.tabContent}>
      {membros.map((membro) => (
        <View key={membro.id} style={styles.membroItem}>
          <View style={styles.membroInfo}>
            <View style={styles.membroHeader}>
              <Text style={styles.membroNome}>{membro.nome}</Text>
              {membro.papel === "admin" && (
                <MaterialIcons
                  name="admin-panel-settings"
                  size={16}
                  color={Theme.colors.primary}
                />
              )}
            </View>
            <Text style={styles.membroEmail}>{membro.email}</Text>
            {membro.posicao_preferida && (
              <Text style={styles.membroPosicao}>
                {membro.posicao_preferida}
              </Text>
            )}
            <View style={styles.membroStats}>
              <Text style={styles.membroStat}>
                Overall: {formatNumber(membro.overall)}
              </Text>
              {membro.assiduidade && (
                <Text style={styles.membroStat}>
                  Assiduidade: {formatPercentage(membro.assiduidade)}
                </Text>
              )}
            </View>
          </View>
          {isAdmin && membro.id !== user?.id && (
            <TouchableOpacity style={styles.removeButton}>
              <MaterialIcons
                name="remove-circle-outline"
                size={24}
                color={Theme.colors.status.error}
              />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {isAdmin && (
        <TouchableOpacity style={styles.addMemberButton}>
          <MaterialIcons
            name="person-add"
            size={24}
            color={Theme.colors.primary}
          />
          <Text style={styles.addMemberText}>Adicionar Membro</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRanking = () => (
    <View style={styles.tabContent}>
      {ranking.map((item) => (
        <View key={item.jogador.id} style={styles.rankingItem}>
          <View style={styles.rankingPosition}>
            <Text style={styles.positionText}>{item.posicao}º</Text>
          </View>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingNome}>{item.jogador.nome}</Text>
            <Text style={styles.rankingOverall}>
              Overall: {formatNumber(item.jogador.overall)}
            </Text>
            <View style={styles.rankingStats}>
              <Text style={styles.rankingStat}>
                Assiduidade:{" "}
                {formatPercentage(item.estatisticas_grupo.assiduidade)}
              </Text>
              <Text style={styles.rankingStat}>
                Presenças: {formatInteger(item.estatisticas_grupo.presencas)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return Theme.colors.primary;
      case "em_andamento":
        return Theme.colors.status.warning;
      case "finalizada":
        return Theme.colors.status.success;
      case "cancelada":
        return Theme.colors.status.error;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "agendada":
        return "Agendada";
      case "em_andamento":
        return "Em andamento";
      case "finalizada":
        return "Finalizada";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const renderTabContent = () => {
    if (tabLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case "partidas":
        return renderPartidas();
      case "membros":
        return renderMembros();
      case "ranking":
        return renderRanking();
      default:
        return null;
    }
  };

  if (loading || !grupo) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={grupo.nome} showBackButton scrollable={false}>
      <View style={styles.container}>
        {/* Header Info */}
        <View style={styles.header}>
          {grupo.descricao && (
            <Text style={styles.description}>{grupo.descricao}</Text>
          )}

          <View style={styles.headerStats}>
            {grupo.localizacao && (
              <View style={styles.headerStat}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={Theme.colors.text.secondary}
                />
                <Text style={styles.headerStatText}>{grupo.localizacao}</Text>
              </View>
            )}
            <View style={styles.headerStat}>
              <MaterialIcons
                name="group"
                size={16}
                color={Theme.colors.text.secondary}
              />
              <Text style={styles.headerStatText}>
                {grupo.total_membros || 0} membros
              </Text>
            </View>
            <View style={styles.headerStat}>
              <MaterialIcons
                name="sports-volleyball"
                size={16}
                color={Theme.colors.text.secondary}
              />
              <Text style={styles.headerStatText}>
                {grupo.total_partidas || 0} partidas
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["partidas", "membros", "ranking"] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
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

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
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
  header: {
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  headerStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  headerStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerStatText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginLeft: 4,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.lg,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: Theme.colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyContainer: {
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  emptyButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  partidaItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  partidaInfo: {
    flex: 1,
  },
  partidaData: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  partidaLocal: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  partidaStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  partidaStat: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  membroItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  membroInfo: {
    flex: 1,
  },
  membroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  membroNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    flex: 1,
  },
  membroEmail: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  membroPosicao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  membroStats: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  membroStat: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  removeButton: {
    padding: Theme.spacing.sm,
  },
  addMemberButton: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: "dashed",
  },
  addMemberText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.sm,
  },
  rankingItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  rankingPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  positionText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  rankingOverall: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  rankingStats: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  rankingStat: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
});
