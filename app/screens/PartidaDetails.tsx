import { formatDate, formatDuration } from "@/common/utils/formatters";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import PartidasService, {
  ConfirmacoesPartida,
  PartidaDetalhes,
} from "@/services/api/partidas";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useAuth } from "../context/authContext";

export default function PartidaDetailsScreen() {
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacoesPartida | null>(
    null
  );
  const [partidaDetalhes, setPartidaDetalhes] =
    useState<PartidaDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingPresence, setConfirmingPresence] = useState(false);
  const [alterandoDecisao, setAlterandoDecisao] = useState(false); // Para controlar quando está alterando

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();
  const { user } = useAuth();

  // Verificar se o usuário é administrador do grupo
  const isAdmin = partidaDetalhes?.partida.grupo?.meu_papel === "admin";

  const loadConfirmacoes = useCallback(
    async (showLoading = true) => {
      if (!partidaId) return;

      try {
        if (showLoading) setLoading(true);

        // Carregar confirmações e informações do grupo em paralelo
        const [confirmacoesResponse, detalhesResponse] = await Promise.all([
          PartidasService.getConfirmacoes(Number(partidaId)),
          PartidasService.getDetalhes(Number(partidaId)),
        ]);

        // Garantir que as arrays existam com valores padrão
        const confirmacoesComGrupo: ConfirmacoesPartida = {
          ...confirmacoesResponse,
          confirmados: confirmacoesResponse.confirmados || [],
          fila_espera: confirmacoesResponse.fila_espera || [],
          naoComparecer: confirmacoesResponse.naoComparecer || [],
          partida: {
            ...confirmacoesResponse.partida,
            grupo: detalhesResponse.partida.grupo,
          },
        };

        // Garantir que times exista
        const detalhesComTimes = {
          ...detalhesResponse,
          partida: {
            ...detalhesResponse.partida,
            times: detalhesResponse.partida.times || [],
          },
        };

        setConfirmacoes(confirmacoesComGrupo);
        setPartidaDetalhes(detalhesComTimes);
      } catch (error) {
        console.error("Erro ao carregar dados da partida:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes da partida");
        router.back();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [partidaId, router]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConfirmacoes(false);
  }, [loadConfirmacoes]);

  useEffect(() => {
    loadConfirmacoes();
  }, [loadConfirmacoes]);

  const handlePresencaPartida = async (
    status: "confirmado" | "nao_confirmado"
  ) => {
    if (!partidaId) return;

    setConfirmingPresence(true);
    try {
      await PartidasService.confirmarPresenca(Number(partidaId), status);
      setAlterandoDecisao(false); // Resetar estado de alteração
      await loadConfirmacoes(false); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    } finally {
      setConfirmingPresence(false);
    }
  };

  const handleResetarDecisao = () => {
    // Alert.alert(
    //   "Alterar Decisão",
    //   "Deseja alterar sua decisão sobre esta partida?",
    //   [
    //     {
    //       text: "Cancelar",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Sim, alterar",
    //       onPress: () => {
    setAlterandoDecisao(true);
    //         },
    //       },
    //     ]
    //   );
  };

  const handleSortearTimes = () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }
    router.push(`/screens/SortearTimes?partidaId=${partidaId}`);
  };
  const handleIniciarJogos = async () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }

    try {
      const response = await PartidasService.iniciarPelada(Number(partidaId));
      Alert.alert("Pelada iniciada!", response.message || "", [
        {
          text: "Gerenciar Jogos",
          onPress: () =>
            router.replace(`/screens/GerenciarJogos?partidaId=${partidaId}`),
        },
      ]);
    } catch (error: any) {
      console.error("Erro ao iniciar pelada:", error);
      let mensagemErro = "Não foi possível iniciar a pelada.";
      if (error.response?.status === 403) {
        mensagemErro = "Apenas administradores podem iniciar a pelada.";
      } else if (error.response?.status === 409) {
        mensagemErro = "Já existe uma pelada em andamento.";
      }
      Alert.alert("Erro", mensagemErro);
    }
  };

  const handleGerenciarJogos = () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }

    router.push(`/screens/GerenciarJogos?partidaId=${partidaId}`);
  };

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

  const getMyStatus = () => {
    if (!confirmacoes || !user) return null;

    // Se está alterando decisão, forçar status de não respondido
    if (alterandoDecisao) return "nao_respondido";

    // Verificar se estou nos confirmados
    const confirmado = (confirmacoes.confirmados || []).find(
      (c) => c.jogador.id === user.id
    );
    if (confirmado) return "confirmado";

    // Verificar se estou na fila de espera
    const filaEspera = (confirmacoes.fila_espera || []).find(
      (c) => c.jogador.id === user.id
    );
    if (filaEspera) return "fila_espera";

    // Verificar se estou na lista de não comparecer
    const naoComparecer = (confirmacoes.naoComparecer || []).find(
      (c) => c.jogador.id === user.id
    );
    if (naoComparecer) return "nao_confirmado";

    return "nao_respondido";
  };

  const renderJogador = (
    item: any,
    isFilaEspera = false,
    isCancelado = false
  ) => (
    <View
      key={item.jogador.id}
      style={[
        styles.jogadorItem,
        isFilaEspera && styles.jogadorFilaEspera,
        isCancelado && styles.jogadorCancelado,
      ]}
    >
      <View style={styles.jogadorInfo}>
        <Text
          style={[
            styles.jogadorNome,
            isCancelado && styles.jogadorCanceladoText,
          ]}
        >
          {item.jogador.nome}
        </Text>
        {item.jogador.posicao_preferida && (
          <Text
            style={[
              styles.jogadorPosicao,
              isCancelado && styles.jogadorCanceladoText,
            ]}
          >
            {item.jogador.posicao_preferida}
          </Text>
        )}
        <Text
          style={[
            styles.jogadorOverall,
            isCancelado && styles.jogadorCanceladoText,
          ]}
        >
          Overall: {item.jogador.overall}
        </Text>
      </View>
      {isFilaEspera && (
        <View style={styles.filaEsperaBadge}>
          <Text style={styles.filaEsperaText}>Fila</Text>
        </View>
      )}
      {isCancelado && (
        <View style={styles.canceladoBadge}>
          <MaterialIcons
            name="cancel"
            size={20}
            color={Theme.colors.status.error}
          />
          <Text style={styles.canceladoText}>Cancelou</Text>
        </View>
      )}
    </View>
  );

  if (loading || !confirmacoes) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  const myStatus = getMyStatus();
  const partida = confirmacoes.partida;

  return (
    <ScreenLayout title="Detalhes da Partida" showBackButton scrollable={false}>
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
        {/* Info da Partida */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Informações da Partida</Text>
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

          <View style={styles.infoRow}>
            <MaterialIcons
              name="event"
              size={20}
              color={Theme.colors.primary}
            />
            <Text style={styles.infoText}>{formatDate(partida.data_hora)}</Text>
          </View>

          {partida.local && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.infoText}>{partida.local}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons
              name="group"
              size={20}
              color={Theme.colors.primary}
            />
            <Text style={styles.infoText}>
              {/* {confirmacoes.confirmados?.length || 0}/{partida.limite_jogadores}{" "} */}
              confirmados
            </Text>
          </View>

          {partidaDetalhes?.partida.valor_pelada && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.infoText}>
                R${" "}
                {typeof partidaDetalhes.partida.valor_pelada === "number"
                  ? partidaDetalhes.partida.valor_pelada.toFixed(2)
                  : Number(partidaDetalhes.partida.valor_pelada).toFixed(2)}
              </Text>
            </View>
          )}

          {partidaDetalhes?.partida.duracao_estimada_minutos && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="schedule"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.infoText}>
                Duração:{" "}
                {formatDuration(
                  partidaDetalhes.partida.duracao_estimada_minutos
                )}
              </Text>
            </View>
          )}

          {(confirmacoes.fila_espera?.length || 0) > 0 && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="queue"
                size={20}
                color={Theme.colors.status.warning}
              />
              <Text style={styles.infoText}>
                {/* {confirmacoes.fila_espera?.length || 0} na fila de espera */}
              </Text>
            </View>
          )}

          {(confirmacoes.naoComparecer?.length || 0) > 0 && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="cancel"
                size={20}
                color={Theme.colors.status.error}
              />
              <Text style={styles.infoText}>
                {/* {confirmacoes.naoComparecer?.length || 0} não participarão */}
              </Text>
            </View>
          )}
        </View>

        {/* Sorteio de Times - Apenas para Admins */}
        {partida.status === "agendada" &&
          (confirmacoes.confirmados?.length || 0) >= 2 &&
          isAdmin && (
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Sorteio de Times</Text>
              <TouchableOpacity
                style={styles.sortearTimesButton}
                onPress={handleSortearTimes}
                disabled={confirmingPresence}
              >
                <MaterialIcons
                  name="shuffle"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text style={styles.sortearTimesText}>Sortear Times</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Sistema de Jogos - Admins */}
        {(partida.status === "agendada" || partida.status === "em_andamento") &&
          (partidaDetalhes?.partida.times?.length || 0) >= 2 &&
          isAdmin && (
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Sistema de Jogos</Text>
              <Text style={styles.jogoDescricao}>
                {partidaDetalhes?.partida.times?.length || 0} times disponíveis
                para jogos sequenciais
              </Text>

              <View style={styles.jogosButtonsContainer}>
                {partida.status === "agendada" && (
                  <TouchableOpacity
                    style={styles.iniciarJogosButton}
                    onPress={handleIniciarJogos}
                    disabled={confirmingPresence}
                  >
                    <MaterialIcons
                      name="play-arrow"
                      size={20}
                      color={Theme.colors.text.primary}
                    />
                    <Text style={styles.iniciarJogosText}>Iniciar Pelada</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.gerenciarJogosButton}
                  onPress={handleGerenciarJogos}
                  disabled={confirmingPresence}
                >
                  <MaterialIcons
                    name="sports-volleyball"
                    size={20}
                    color={Theme.colors.text.primary}
                  />
                  <Text style={styles.gerenciarJogosText}>Ver Jogos</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Botões de Ação */}
        {partida.status === "agendada" && (
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Sua Confirmação</Text>

            {myStatus === "confirmado" && (
              <View style={styles.myStatusContainer}>
                <View style={styles.statusInfo}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={Theme.colors.status.success}
                  />
                  <Text style={styles.myStatusText}>Irei participar</Text>
                </View>
                <TouchableOpacity
                  style={styles.statusActionButton}
                  onPress={() => handleResetarDecisao()}
                  disabled={confirmingPresence}
                >
                  <Text style={styles.statusActionText}>Alterar</Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "nao_confirmado" && (
              <View style={styles.myStatusContainer}>
                <View style={styles.statusInfo}>
                  <MaterialIcons
                    name="cancel"
                    size={24}
                    color={Theme.colors.status.error}
                  />
                  <Text style={styles.myStatusText}>Não irei participar</Text>
                </View>
                <TouchableOpacity
                  style={styles.statusActionButton}
                  onPress={() => handleResetarDecisao()}
                  disabled={confirmingPresence}
                >
                  <Text style={styles.statusActionText}>Alterar</Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "fila_espera" && (
              <View style={styles.myStatusContainer}>
                <View style={styles.statusInfo}>
                  <MaterialIcons
                    name="queue"
                    size={24}
                    color={Theme.colors.status.warning}
                  />
                  <Text style={styles.myStatusText}>
                    Você está na fila de espera
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.statusActionButton}
                  onPress={() => handlePresencaPartida("nao_confirmado")}
                  disabled={confirmingPresence}
                >
                  <Text style={styles.statusActionText}>Sair da fila</Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "nao_respondido" && (
              <>
                {alterandoDecisao && (
                  <View style={styles.alterandoDecisaoContainer}>
                    <Text style={styles.alterandoDecisaoText}>
                      Escolha sua nova decisão:
                    </Text>
                    <TouchableOpacity
                      style={styles.cancelarAlteracaoButton}
                      onPress={() => setAlterandoDecisao(false)}
                    >
                      <Text style={styles.cancelarAlteracaoText}>
                        Manter decisão anterior
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmarButton]}
                    onPress={() => handlePresencaPartida("confirmado")}
                    disabled={confirmingPresence}
                  >
                    {confirmingPresence ? (
                      <ActivityIndicator color={Theme.colors.text.primary} />
                    ) : (
                      <>
                        <MaterialIcons
                          name="check"
                          size={20}
                          color={Theme.colors.text.primary}
                        />
                        <Text style={styles.actionButtonText}>Confirmar</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelarButton]}
                    onPress={() => handlePresencaPartida("nao_confirmado")}
                    disabled={confirmingPresence}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={Theme.colors.text.primary}
                    />
                    <Text style={styles.actionButtonText}>Não participar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Lista de Confirmados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Confirmados ({confirmacoes.confirmados?.length || 0})
          </Text>
          {(confirmacoes.confirmados?.length || 0) === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="group"
                size={48}
                color={Theme.colors.text.secondary}
              />
              <Text style={styles.emptyText}>
                Nenhum jogador confirmado ainda
              </Text>
            </View>
          ) : (
            (confirmacoes.confirmados || []).map((item) => renderJogador(item))
          )}
        </View>

        {/* Lista de Fila de Espera */}
        {(confirmacoes.fila_espera?.length || 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Fila de Espera ({confirmacoes.fila_espera?.length || 0})
            </Text>
            {(confirmacoes.fila_espera || []).map((item) =>
              renderJogador(item, true)
            )}
          </View>
        )}

        {/* Lista de Jogadores que Cancelaram */}
        {(confirmacoes.naoComparecer?.length || 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Não Participarão ({confirmacoes.naoComparecer?.length || 0})
            </Text>
            {(confirmacoes.naoComparecer || []).map((item) =>
              renderJogador(item, false, true)
            )}
          </View>
        )}

        {/* Times da Partida */}
        {(partidaDetalhes?.partida.times?.length || 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Times ({partidaDetalhes?.partida.times?.length || 0})
            </Text>
            {(partidaDetalhes?.partida.times || []).map((time, index) => (
              <View key={time.id} style={styles.timeCard}>
                <View style={styles.timeHeader}>
                  <Text style={styles.timeNome}>{time.nome_time}</Text>
                  <View style={styles.timePontuacao}>
                    <Text style={styles.pontuacaoText}>
                      {time.pontuacao_final} pts
                    </Text>
                  </View>
                </View>

                <View style={styles.timeStats}>
                  <Text style={styles.timeStatsText}>
                    {time.total_jogadores || time.jogador_time.length} jogadores
                  </Text>
                  {time.overall_medio && (
                    <Text style={styles.timeStatsText}>
                      Overall médio: {time.overall_medio}
                    </Text>
                  )}
                </View>

                <View style={styles.jogadoresTime}>
                  {time.jogador_time.map((jogador) => (
                    <View
                      key={jogador.jogador.id}
                      style={styles.jogadorTimeItem}
                    >
                      <Text style={styles.jogadorTimeNome}>
                        {jogador.jogador.usuario.nome}
                      </Text>
                      {jogador.posicao_jogada && (
                        <Text style={styles.jogadorTimePosicao}>
                          {jogador.posicao_jogada}
                        </Text>
                      )}
                      <Text style={styles.jogadorTimeOverall}>
                        Overall: {jogador.jogador.overall}
                      </Text>
                    </View>
                  ))}
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
  infoCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  infoTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
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
  actionsCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  myStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
  },
  myStatusText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
    fontWeight: "500",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  confirmarButton: {
    backgroundColor: Theme.colors.status.success,
  },
  cancelarButton: {
    backgroundColor: Theme.colors.status.error,
  },
  activeButton: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  section: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  jogadorItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  jogadorFilaEspera: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.status.warning,
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
    marginBottom: 2,
  },
  jogadorOverall: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  filaEsperaBadge: {
    backgroundColor: Theme.colors.status.warning,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  filaEsperaText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmedButtonText: {
    color: Theme.colors.status.success,
    fontWeight: "700",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusActionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.status.error,
    borderRadius: Theme.borderRadius.sm,
  },
  statusActionText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  jogadorCancelado: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.status.error,
    opacity: 0.7,
    backgroundColor: Theme.colors.background,
  },
  jogadorCanceladoText: {
    color: Theme.colors.text.secondary,
    textDecorationLine: "line-through",
  },
  canceladoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.status.error,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    gap: 4,
  },
  canceladoText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  alterandoDecisaoContainer: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  alterandoDecisaoText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.primary,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  cancelarAlteracaoButton: {
    alignSelf: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  cancelarAlteracaoText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    textDecorationLine: "underline",
  },
  sortearTimesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  sortearTimesText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  timeCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  timeNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  timePontuacao: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  pontuacaoText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  timeStats: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  timeStatsText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
  jogadoresTime: {
    gap: Theme.spacing.xs,
  },
  jogadorTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
  },
  jogadorTimeNome: {
    fontSize: Theme.fontSize.sm,
    fontWeight: "500",
    color: Theme.colors.text.primary,
    flex: 1,
  },
  jogadorTimePosicao: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.primary,
    marginHorizontal: Theme.spacing.sm,
  },
  jogadorTimeOverall: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  jogoDescricao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
    textAlign: "center",
  },
  iniciarJogosButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.status.success,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  iniciarJogosText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  jogosButtonsContainer: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  gerenciarJogosButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  gerenciarJogosText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
});
