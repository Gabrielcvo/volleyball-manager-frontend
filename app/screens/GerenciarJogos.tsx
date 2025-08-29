import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import JogosService, { JogosPartida, StatusJogo } from "@/services/api/jogos";
import TimesService from "@/services/api/times";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GerenciarJogosScreen() {
  const [jogosData, setJogosData] = useState<JogosPartida | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [creatingNext, setCreatingNext] = useState(false);
  const [finalizandoPelada, setFinalizandoPelada] = useState(false);
  const [timesDisponiveis, setTimesDisponiveis] = useState<
    { id: number; nome_time: string }[]
  >([]);
  const [selectedTimeAId, setSelectedTimeAId] = useState<number | null>(null);
  const [selectedTimeBId, setSelectedTimeBId] = useState<number | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();

  const loadJogos = useCallback(
    async (showLoading = true) => {
      if (!partidaId) return;

      try {
        if (showLoading) setLoading(true);
        const data = await JogosService.listar(Number(partidaId));
        setJogosData(data);
      } catch (error: any) {
        console.error("Erro ao carregar jogos:", error);

        // Se for erro 404, significa que não há jogos criados ainda
        if (error.response?.status === 404) {
          Alert.alert(
            "Nenhum jogo encontrado",
            "Esta partida ainda não possui jogos criados. Volte para os detalhes da partida e clique em 'Inicializar Jogos'.",
            [{ text: "Voltar", onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível carregar os jogos. Verifique sua conexão e tente novamente."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [partidaId, router]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setJogosData(null); // Limpar dados antes de recarregar
    loadJogos(false);
  }, [loadJogos]);

  useEffect(() => {
    // Limpar dados quando partidaId muda
    setJogosData(null);
    loadJogos();
  }, [loadJogos, partidaId]);

  // Recarregar quando a tela ganhar foco (sem limpar dados)
  useFocusEffect(
    useCallback(() => {
      loadJogos(false); // Recarrega silenciosamente
    }, [loadJogos])
  );

  // Carregar times disponíveis - apenas quando partidaId muda
  useEffect(() => {
    const fetchTimes = async () => {
      if (!partidaId) return;
      try {
        const resp = await TimesService.listar(Number(partidaId));
        const base = (resp.times || []).map((t) => ({
          id: t.id,
          nome_time: t.nome_time,
        }));
        setTimesDisponiveis(base);
        // Resetar seleção apenas se necessário
        setSelectedTimeAId((current) =>
          current && base.find((t) => t.id === current) ? current : null
        );
        setSelectedTimeBId((current) =>
          current && base.find((t) => t.id === current) ? current : null
        );
      } catch {
        // silencioso
      }
    };
    fetchTimes();
  }, [partidaId]); // Removido selectedTimeAId e selectedTimeBId das dependências

  // Auto-refresh quando há jogo ativo
  useEffect(() => {
    if (!autoRefreshEnabled || !jogosData?.status_geral?.jogo_em_andamento) {
      return;
    }

    const interval = setInterval(() => {
      loadJogos(false); // Refresh silencioso a cada 10 segundos
    }, 10000);

    return () => clearInterval(interval);
  }, [
    jogosData?.status_geral?.jogo_em_andamento,
    autoRefreshEnabled,
    loadJogos,
  ]);

  const handleIniciarJogo = async (jogoId: number) => {
    try {
      setActionLoading(jogoId);
      const response = await JogosService.iniciarJogo(jogoId);

      Alert.alert("Jogo Iniciado!", response.message, [
        {
          text: "Ir para Placar",
          onPress: () => router.push(`/screens/PlacarJogo?jogoId=${jogoId}`),
        },
        {
          text: "Ficar Aqui",
          onPress: () => loadJogos(false),
        },
      ]);
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
      Alert.alert("Erro", "Não foi possível iniciar o jogo");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: StatusJogo) => {
    switch (status) {
      case "agendado":
        return Theme.colors.status.warning;
      case "em_andamento":
        return Theme.colors.primary;
      case "finalizado":
        return Theme.colors.status.success;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: StatusJogo) => {
    switch (status) {
      case "agendado":
        return "schedule";
      case "em_andamento":
        return "sports-volleyball";
      case "finalizado":
        return "check-circle";
      default:
        return "help";
    }
  };

  const getStatusText = (status: StatusJogo) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "em_andamento":
        return "Em Andamento";
      case "finalizado":
        return "Finalizado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ScreenLayout title="Gerenciar Jogos" showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando jogos...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!jogosData) {
    return (
      <ScreenLayout title="Gerenciar Jogos" showBackButton>
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="sports-volleyball"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text style={styles.emptyText}>Nenhum jogo encontrado</Text>
          <Text style={styles.emptySubtext}>
            Volte para os detalhes da partida e clique em &quot;Inicializar
            Jogos&quot;
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const jogoAtivo = jogosData.jogos.find((j) => j.status === "em_andamento");
  const peladaFinalizada = jogosData.partida.status === "finalizada";
  const proximoJogo = jogosData.jogos.find((j) => j.status === "agendado");

  return (
    <ScreenLayout title="Gerenciar Jogos" showBackButton>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
      >
        {/* Status Geral */}
        <View style={styles.statusCard}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>Status da Partida</Text>
            {jogosData?.status_geral?.jogo_em_andamento && (
              <TouchableOpacity
                onPress={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                style={{ padding: 4 }}
              >
                <Text
                  style={{
                    color: autoRefreshEnabled
                      ? Theme.colors.status.success
                      : Theme.colors.text.secondary,
                    fontSize: 12,
                  }}
                >
                  Auto-refresh {autoRefreshEnabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {jogosData.status_geral.jogos_total}
              </Text>
              <Text style={styles.statLabel}>Total de Jogos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {jogosData.status_geral.jogos_finalizados}
              </Text>
              <Text style={styles.statLabel}>Finalizados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {jogosData.status_geral.jogos_pendentes}
              </Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
          </View>
        </View>

        {/* Pelada finalizada banner */}
        {peladaFinalizada && (
          <View style={styles.serieCard}>
            <Text style={styles.sectionTitle}>Pelada finalizada</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: Theme.colors.status.success },
              ]}
            >
              <MaterialIcons name="flag" size={16} color="#FFFFFF" />
              <Text style={styles.statusBadgeText}>
                Nenhuma ação disponível
              </Text>
            </View>
          </View>
        )}

        {/* Jogo Ativo */}
        {jogoAtivo && (
          <View style={styles.activeGameCard}>
            <Text style={styles.sectionTitle}>🏐 Jogo em Andamento</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameNumber}>
                Jogo #{jogoAtivo.numero_jogo}
              </Text>
              <Text style={styles.gameTeams}>
                {jogoAtivo.time_a.nome} vs {jogoAtivo.time_b.nome}
              </Text>
              <Text style={styles.gamePlacar}>
                {jogoAtivo.placar.time_a} x {jogoAtivo.placar.time_b}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/screens/PlacarJogo?jogoId=${jogoAtivo.id}`)
              }
            >
              <MaterialIcons
                name="sports-volleyball"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Controlar Jogo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Próximo Jogo */}
        {proximoJogo && !jogoAtivo && !peladaFinalizada && (
          <View style={styles.nextGameCard}>
            <Text style={styles.sectionTitle}>⏳ Próximo Jogo</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameNumber}>
                Jogo #{proximoJogo.numero_jogo}
              </Text>
              <Text style={styles.gameTeams}>
                {proximoJogo.time_a.nome} vs {proximoJogo.time_b.nome}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleIniciarJogo(proximoJogo.id)}
              disabled={actionLoading === proximoJogo.id || peladaFinalizada}
            >
              {actionLoading === proximoJogo.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Iniciar Jogo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Ações de Pelada (quando não há jogo em andamento) */}
        {!jogoAtivo && !peladaFinalizada && (
          <View style={styles.gamesListCard}>
            <Text style={styles.sectionTitle}>Ações</Text>

            {/* Seleção de Times com Interface Visual */}
            <View style={{ marginBottom: Theme.spacing.md }}>
              <Text style={styles.sectionTitle}>
                Selecione os times para o jogo
              </Text>

              {/* Campo de Jogo Visual */}
              <View style={styles.gameFieldContainer}>
                {/* Lado Esquerdo - Time A */}
                <View style={styles.teamSide}>
                  <Text style={styles.teamSideLabel}>Time A</Text>
                  <View
                    style={[
                      styles.teamSlot,
                      selectedTimeAId ? styles.teamSlotOccupied : null,
                    ]}
                  >
                    {selectedTimeAId ? (
                      <TouchableOpacity
                        style={styles.selectedTeamCard}
                        onPress={() => setSelectedTimeAId(null)}
                      >
                        <MaterialIcons
                          name="sports-volleyball"
                          size={20}
                          color={Theme.colors.text.primary}
                        />
                        <Text style={styles.selectedTeamName}>
                          {
                            timesDisponiveis.find(
                              (t) => t.id === selectedTimeAId
                            )?.nome_time
                          }
                        </Text>
                        <MaterialIcons
                          name="close"
                          size={16}
                          color={Theme.colors.text.secondary}
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot}>
                        <MaterialIcons
                          name="add"
                          size={24}
                          color={Theme.colors.text.secondary}
                        />
                        <Text style={styles.emptySlotText}>
                          Toque em um time
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Separador VS */}
                <View style={styles.vsSeparator}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                {/* Lado Direito - Time B */}
                <View style={styles.teamSide}>
                  <Text style={styles.teamSideLabel}>Time B</Text>
                  <View
                    style={[
                      styles.teamSlot,
                      selectedTimeBId ? styles.teamSlotOccupied : null,
                    ]}
                  >
                    {selectedTimeBId ? (
                      <TouchableOpacity
                        style={styles.selectedTeamCard}
                        onPress={() => setSelectedTimeBId(null)}
                      >
                        <MaterialIcons
                          name="sports-volleyball"
                          size={20}
                          color={Theme.colors.text.primary}
                        />
                        <Text style={styles.selectedTeamName}>
                          {
                            timesDisponiveis.find(
                              (t) => t.id === selectedTimeBId
                            )?.nome_time
                          }
                        </Text>
                        <MaterialIcons
                          name="close"
                          size={16}
                          color={Theme.colors.text.secondary}
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot}>
                        <MaterialIcons
                          name="add"
                          size={24}
                          color={Theme.colors.text.secondary}
                        />
                        <Text style={styles.emptySlotText}>
                          Toque em um time
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Lista de Times Disponíveis */}
              <Text style={styles.availableTeamsLabel}>Times disponíveis:</Text>
              <View style={styles.availableTeamsContainer}>
                {timesDisponiveis.length === 0 ? (
                  <Text
                    style={{
                      color: Theme.colors.text.secondary,
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    Nenhum time disponível
                  </Text>
                ) : (
                  timesDisponiveis.map((time) => {
                    const isSelected =
                      selectedTimeAId === time.id ||
                      selectedTimeBId === time.id;
                    return (
                      <TouchableOpacity
                        key={time.id}
                        style={[
                          styles.availableTeamCard,
                          isSelected && styles.availableTeamCardSelected,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            // Remove from current position
                            if (selectedTimeAId === time.id)
                              setSelectedTimeAId(null);
                            if (selectedTimeBId === time.id)
                              setSelectedTimeBId(null);
                          } else {
                            // Add to empty slot or replace
                            if (!selectedTimeAId) {
                              setSelectedTimeAId(time.id);
                            } else if (!selectedTimeBId) {
                              setSelectedTimeBId(time.id);
                            } else {
                              // Both slots occupied, replace Time A
                              setSelectedTimeAId(time.id);
                            }
                          }
                        }}
                        disabled={isSelected}
                      >
                        <MaterialIcons
                          name="sports-volleyball"
                          size={16}
                          color={
                            isSelected
                              ? Theme.colors.text.secondary
                              : Theme.colors.primary
                          }
                        />
                        <Text
                          style={[
                            styles.availableTeamName,
                            isSelected && styles.availableTeamNameSelected,
                          ]}
                        >
                          {time.nome_time}
                        </Text>
                        {isSelected && (
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={Theme.colors.status.success}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                if (!partidaId) return;
                if (peladaFinalizada) {
                  Alert.alert(
                    "Pelada finalizada",
                    "Não é possível criar novos jogos."
                  );
                  return;
                }
                if (!selectedTimeAId || !selectedTimeBId) {
                  Alert.alert(
                    "Selecione os times",
                    "Escolha o Time A e o Time B para criar o jogo."
                  );
                  return;
                }
                if (selectedTimeAId === selectedTimeBId) {
                  Alert.alert(
                    "Times inválidos",
                    "Os times devem ser diferentes."
                  );
                  return;
                }
                try {
                  setCreatingNext(true);
                  const a = timesDisponiveis.find(
                    (t) => t.id === selectedTimeAId
                  )!;
                  const b = timesDisponiveis.find(
                    (t) => t.id === selectedTimeBId
                  )!;
                  const response = await JogosService.criarJogo(
                    Number(partidaId),
                    {
                      time_a_id: a.id,
                      time_b_id: b.id,
                    }
                  );
                  Alert.alert(
                    "Jogo criado",
                    `Jogo #${response.jogo.numero_jogo} criado: ${a.nome_time} vs ${b.nome_time}`,
                    [
                      {
                        text: "Iniciar agora",
                        onPress: () => {
                          loadJogos(false); // Recarrega dados primeiro
                          handleIniciarJogo(response.jogo.id);
                        },
                      },
                      {
                        text: "OK",
                        onPress: () => {
                          // Resetar seleções após criar jogo
                          setSelectedTimeAId(null);
                          setSelectedTimeBId(null);
                          loadJogos(false);
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error("Erro ao criar jogo:", error);
                  Alert.alert("Erro", "Não foi possível criar o jogo.");
                } finally {
                  setCreatingNext(false);
                }
              }}
              disabled={creatingNext}
            >
              {creatingNext ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>
                    Criar próximo jogo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { marginTop: Theme.spacing.md }]}
              onPress={async () => {
                if (!partidaId) return;
                if (peladaFinalizada) return;
                try {
                  setFinalizandoPelada(true);
                  const response = await JogosService.finalizarPelada(
                    Number(partidaId)
                  );
                  Alert.alert("Pelada finalizada", response.message || "", [
                    {
                      text: "OK",
                      onPress: () => {
                        // Recarregar dados para mostrar status finalizado
                        loadJogos(false);
                      },
                    },
                  ]);
                } catch (error) {
                  console.error("Erro ao finalizar pelada:", error);
                  Alert.alert("Erro", "Não foi possível finalizar a pelada.");
                } finally {
                  setFinalizandoPelada(false);
                }
              }}
              disabled={finalizandoPelada}
            >
              {finalizandoPelada ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="flag" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Finalizar pelada</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Jogos */}
        <View style={styles.gamesListCard}>
          <Text style={styles.sectionTitle}>Lista de Jogos</Text>
          {jogosData.jogos.map((jogo) => (
            <View key={jogo.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameNumberSmall}>
                  Jogo #{jogo.numero_jogo}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(jogo.status) },
                  ]}
                >
                  <MaterialIcons
                    name={getStatusIcon(jogo.status)}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {getStatusText(jogo.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.gameTeamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{jogo.time_a.nome}</Text>
                  <Text style={styles.teamScore}>{jogo.placar.time_a}</Text>
                </View>

                <Text style={styles.versus}>VS</Text>

                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{jogo.time_b.nome}</Text>
                  <Text style={styles.teamScore}>{jogo.placar.time_b}</Text>
                </View>
              </View>

              {jogo.time_vencedor && (
                <View style={styles.winnerInfo}>
                  <MaterialIcons
                    name="emoji-events"
                    size={16}
                    color={Theme.colors.status.success}
                  />
                  <Text style={styles.winnerText}>
                    Vencedor: {jogo.time_vencedor.nome}
                  </Text>
                </View>
              )}

              {jogo.timing?.data_inicio && (
                <Text style={styles.gameTime}>
                  Iniciado: {new Date(jogo.timing.data_inicio).toLocaleString()}
                  {jogo.timing.duracao_minutos &&
                    ` • ${jogo.timing.duracao_minutos} min`}
                </Text>
              )}

              {jogo.status === "agendado" && !peladaFinalizada && (
                <TouchableOpacity
                  style={styles.startGameButton}
                  onPress={() => handleIniciarJogo(jogo.id)}
                  disabled={actionLoading === jogo.id}
                >
                  {actionLoading === jogo.id ? (
                    <ActivityIndicator
                      size="small"
                      color={Theme.colors.primary}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="play-arrow"
                        size={16}
                        color={Theme.colors.primary}
                      />
                      <Text style={styles.startGameText}>Iniciar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {jogo.status === "em_andamento" && (
                <TouchableOpacity
                  style={styles.manageGameButton}
                  onPress={() =>
                    router.push(`/screens/PlacarJogo?jogoId=${jogo.id}`)
                  }
                >
                  <MaterialIcons
                    name="sports-volleyball"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.manageGameText}>Controlar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Estatísticas dos Times */}
        {jogosData.times && jogosData.times.length > 0 && (
          <View style={styles.teamsStatsCard}>
            <Text style={styles.sectionTitle}>Estatísticas dos Times</Text>
            {jogosData.times.map((time) => (
              <View key={time.time_id} style={styles.teamStatsRow}>
                <Text style={styles.teamStatsName}>{time.nome_time}</Text>
                <View style={styles.teamStatsNumbers}>
                  <Text style={styles.teamStat}>{time.vitorias}V</Text>
                  <Text style={styles.teamStat}>{time.derrotas}D</Text>
                  <Text style={styles.teamStat}>{time.pontos_marcados}P</Text>
                </View>
              </View>
            ))}
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
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: Theme.fontSize.lg,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  emptySubtext: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.sm,
  },
  statusCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Theme.spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  serieCard: {
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
  placarSerie: {
    marginBottom: Theme.spacing.md,
  },
  placarSerieText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
  vencedorSerie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.md,
  },
  vencedorSerieText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "bold",
    color: Theme.colors.status.success,
    marginLeft: Theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  activeGameCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  gameInfo: {
    marginBottom: Theme.spacing.md,
  },
  gameNumber: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.primary,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  gameTeams: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  gamePlacar: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: "bold",
    color: Theme.colors.primary,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: 4,
  },
  actionButtonText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  nextGameCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  gameCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  gamesListCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  gameNumberSmall: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  statusText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  gameTeamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.sm,
  },
  teamInfo: {
    flex: 1,
    alignItems: "center",
  },
  teamName: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "500",
    color: Theme.colors.text.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  teamScore: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.primary,
  },
  versus: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.secondary,
    marginHorizontal: Theme.spacing.md,
  },
  winnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.sm,
  },
  winnerText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.status.success,
    marginLeft: 4,
  },
  gameTime: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Theme.spacing.sm,
  },
  startGameButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.status.success,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: 4,
    marginTop: Theme.spacing.md,
  },
  startGameText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  manageGameButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: 4,
    marginTop: Theme.spacing.md,
  },
  manageGameText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  gameFieldContainer: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  teamSide: {
    flex: 1,
    alignItems: "center",
  },
  teamSideLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    textTransform: "uppercase",
  },
  teamSlot: {
    width: "100%",
    minHeight: 80,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.surface + "50",
  },
  teamSlotOccupied: {
    borderColor: Theme.colors.primary,
    borderStyle: "solid",
    backgroundColor: Theme.colors.primary + "10",
  },
  selectedTeamCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedTeamName: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    textAlign: "center",
    marginHorizontal: Theme.spacing.sm,
  },
  emptySlot: {
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.lg,
  },
  emptySlotText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    fontStyle: "italic",
  },
  vsSeparator: {
    marginHorizontal: Theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.primary,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    overflow: "hidden",
  },
  availableTeamsLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  availableTeamsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  availableTeamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.xs,
    minWidth: 100,
  },
  availableTeamCardSelected: {
    backgroundColor: Theme.colors.background,
    borderColor: Theme.colors.status.success,
    opacity: 0.7,
  },
  availableTeamName: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "500",
    color: Theme.colors.text.primary,
    flex: 1,
  },
  availableTeamNameSelected: {
    color: Theme.colors.text.secondary,
  },
  teamsStatsCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  teamStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  teamStatsName: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  teamStatsNumbers: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamStat: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.primary,
    marginHorizontal: Theme.spacing.xs,
  },
});
