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
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text className="mt-4 text-base text-[#A0A4AB]">
            Carregando jogos...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!jogosData) {
    return (
      <ScreenLayout title="Gerenciar Jogos" showBackButton>
        <View className="items-center p-8 bg-[#23262B] rounded-2xl">
          <MaterialIcons
            name="sports-volleyball"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text className="text-lg text-[#A0A4AB] mt-4">
            Nenhum jogo encontrado
          </Text>
          <Text className="text-sm text-[#A0A4AB] mt-1">
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
        className="flex-1 bg-[#1A1D21]"
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
        <View className="bg-[#23262B] m-4 rounded-2xl p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white mb-4">
              Status da Partida
            </Text>
            {jogosData?.status_geral?.jogo_em_andamento && (
              <TouchableOpacity
                onPress={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className="p-1"
              >
                <Text
                  className="text-xs"
                  style={{
                    color: autoRefreshEnabled
                      ? Theme.colors.status.success
                      : Theme.colors.text.secondary,
                  }}
                >
                  Auto-refresh {autoRefreshEnabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row justify-around mt-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#2D6BFF]">
                {jogosData.status_geral.jogos_total}
              </Text>
              <Text className="text-sm text-[#A0A4AB] mt-1">
                Total de Jogos
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#2D6BFF]">
                {jogosData.status_geral.jogos_finalizados}
              </Text>
              <Text className="text-sm text-[#A0A4AB] mt-1">Finalizados</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#2D6BFF]">
                {jogosData.status_geral.jogos_pendentes}
              </Text>
              <Text className="text-sm text-[#A0A4AB] mt-1">Pendentes</Text>
            </View>
          </View>
        </View>

        {/* Pelada finalizada banner */}
        {peladaFinalizada && (
          <View className="bg-[#23262B] m-4 rounded-2xl p-4">
            <Text className="text-lg font-bold text-white mb-4">
              Pelada finalizada
            </Text>
            <View
              className="flex-row items-center px-3 py-1 rounded-md"
              style={{ backgroundColor: Theme.colors.status.success }}
            >
              <MaterialIcons name="flag" size={16} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white ml-1">
                Nenhuma ação disponível
              </Text>
            </View>
          </View>
        )}

        {/* Jogo Ativo */}
        {jogoAtivo && (
          <View className="bg-[#23262B] m-4 rounded-2xl p-4 border-2 border-[#2D6BFF]">
            <Text className="text-lg font-bold text-white mb-4">
              🏐 Jogo em Andamento
            </Text>
            <View className="mb-4">
              <Text className="text-2xl font-bold text-[#2D6BFF] text-center mb-3">
                Jogo #{jogoAtivo.numero_jogo}
              </Text>
              <Text className="text-lg font-semibold text-white text-center mb-3">
                {jogoAtivo.time_a.nome} vs {jogoAtivo.time_b.nome}
              </Text>
              <Text className="text-3xl font-bold text-[#2D6BFF] text-center">
                {jogoAtivo.placar.time_a} x {jogoAtivo.placar.time_b}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md"
              onPress={() =>
                router.push(`/screens/PlacarJogo?jogoId=${jogoAtivo.id}`)
              }
            >
              <MaterialIcons
                name="sports-volleyball"
                size={20}
                color="#FFFFFF"
              />
              <Text className="text-sm font-semibold text-white ml-1">
                Controlar Jogo
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Próximo Jogo */}
        {proximoJogo && !jogoAtivo && !peladaFinalizada && (
          <View className="bg-[#23262B] m-4 rounded-2xl p-4 border-2 border-[#2D6BFF]">
            <Text className="text-lg font-bold text-white mb-4">
              ⏳ Próximo Jogo
            </Text>
            <View className="mb-4">
              <Text className="text-2xl font-bold text-[#2D6BFF] text-center mb-3">
                Jogo #{proximoJogo.numero_jogo}
              </Text>
              <Text className="text-lg font-semibold text-white text-center mb-3">
                {proximoJogo.time_a.nome} vs {proximoJogo.time_b.nome}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md"
              onPress={() => handleIniciarJogo(proximoJogo.id)}
              disabled={actionLoading === proximoJogo.id || peladaFinalizada}
            >
              {actionLoading === proximoJogo.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white ml-1">
                    Iniciar Jogo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Ações de Pelada (quando não há jogo em andamento) */}
        {!jogoAtivo && !peladaFinalizada && (
          <View className="bg-[#23262B] m-4 rounded-2xl p-4">
            <Text className="text-lg font-bold text-white mb-4">Ações</Text>

            {/* Seleção de Times com Interface Visual */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-white mb-4">
                Selecione os times para o jogo
              </Text>

              {/* Campo de Jogo Visual */}
              <View className="bg-[#1A1D21] rounded-2xl p-4 my-4 flex-row items-center border-2 border-[#2A2D31]">
                {/* Lado Esquerdo - Time A */}
                <View className="flex-1 items-center">
                  <Text className="text-sm font-semibold text-[#A0A4AB] mb-3 uppercase">
                    Time A
                  </Text>
                  <View
                    className={`w-full min-h-20 rounded-md border-2 justify-center items-center ${
                      selectedTimeAId
                        ? "border-[#2D6BFF] border-solid bg-[#2D6BFF]/10"
                        : "border-[#2A2D31] border-dashed bg-[#23262B]/50"
                    }`}
                  >
                    {selectedTimeAId ? (
                      <TouchableOpacity
                        className="flex-row items-center justify-between w-full p-3 bg-[#23262B] rounded-md"
                        onPress={() => setSelectedTimeAId(null)}
                      >
                        <MaterialIcons
                          name="sports-volleyball"
                          size={20}
                          color={Theme.colors.text.primary}
                        />
                        <Text className="flex-1 text-base font-semibold text-white text-center mx-3">
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
                      <View className="items-center justify-center p-4">
                        <MaterialIcons
                          name="add"
                          size={24}
                          color={Theme.colors.text.secondary}
                        />
                        <Text className="text-sm text-[#A0A4AB] mt-1 italic">
                          Toque em um time
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Separador VS */}
                <View className="mx-6 items-center justify-center">
                  <Text className="text-lg font-bold text-[#2D6BFF] bg-[#23262B] px-4 py-3 rounded-xl border-2 border-[#2D6BFF]">
                    VS
                  </Text>
                </View>

                {/* Lado Direito - Time B */}
                <View className="flex-1 items-center">
                  <Text className="text-sm font-semibold text-[#A0A4AB] mb-3 uppercase">
                    Time B
                  </Text>
                  <View
                    className={`w-full min-h-20 rounded-md border-2 justify-center items-center ${
                      selectedTimeBId
                        ? "border-[#2D6BFF] border-solid bg-[#2D6BFF]/10"
                        : "border-[#2A2D31] border-dashed bg-[#23262B]/50"
                    }`}
                  >
                    {selectedTimeBId ? (
                      <TouchableOpacity
                        className="flex-row items-center justify-between w-full p-3 bg-[#23262B] rounded-md"
                        onPress={() => setSelectedTimeBId(null)}
                      >
                        <MaterialIcons
                          name="sports-volleyball"
                          size={20}
                          color={Theme.colors.text.primary}
                        />
                        <Text className="flex-1 text-base font-semibold text-white text-center mx-3">
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
                      <View className="items-center justify-center p-4">
                        <MaterialIcons
                          name="add"
                          size={24}
                          color={Theme.colors.text.secondary}
                        />
                        <Text className="text-sm text-[#A0A4AB] mt-1 italic">
                          Toque em um time
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Lista de Times Disponíveis */}
              <Text className="text-base font-semibold text-white mb-3 mt-4">
                Times disponíveis:
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {timesDisponiveis.length === 0 ? (
                  <Text className="text-[#A0A4AB] text-center p-5 w-full">
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
                        className={`flex-row items-center bg-[#23262B] px-3 py-2 rounded-md border min-w-24 gap-1 ${
                          isSelected
                            ? "bg-[#1A1D21] border-[#4CAF50] opacity-70"
                            : "border-[#2A2D31]"
                        }`}
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
                          className={`text-sm font-medium flex-1 ${
                            isSelected ? "text-[#A0A4AB]" : "text-white"
                          }`}
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
              className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md"
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
                  <Text className="text-sm font-semibold text-white ml-1">
                    Criar próximo jogo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md mt-4"
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
                  <Text className="text-sm font-semibold text-white ml-1">
                    Finalizar pelada
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Jogos */}
        <View className="bg-[#23262B] m-4 rounded-2xl p-4">
          <Text className="text-lg font-bold text-white mb-4">
            Lista de Jogos
          </Text>
          {jogosData.jogos.map((jogo) => (
            <View key={jogo.id} className="bg-[#23262B] rounded-md p-3 mb-3">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-semibold text-white">
                  Jogo #{jogo.numero_jogo}
                </Text>
                <View
                  className="flex-row items-center px-3 py-1 rounded-md"
                  style={{ backgroundColor: getStatusColor(jogo.status) }}
                >
                  <MaterialIcons
                    name={getStatusIcon(jogo.status)}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text className="text-xs font-semibold text-white ml-1">
                    {getStatusText(jogo.status)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 items-center">
                  <Text className="text-sm font-medium text-white text-center mb-1">
                    {jogo.time_a.nome}
                  </Text>
                  <Text className="text-2xl font-bold text-[#2D6BFF]">
                    {jogo.placar.time_a}
                  </Text>
                </View>

                <Text className="text-sm font-semibold text-[#A0A4AB] mx-4">
                  VS
                </Text>

                <View className="flex-1 items-center">
                  <Text className="text-sm font-medium text-white text-center mb-1">
                    {jogo.time_b.nome}
                  </Text>
                  <Text className="text-2xl font-bold text-[#2D6BFF]">
                    {jogo.placar.time_b}
                  </Text>
                </View>
              </View>

              {jogo.time_vencedor && (
                <View className="flex-row items-center justify-center mt-3">
                  <MaterialIcons
                    name="emoji-events"
                    size={16}
                    color={Theme.colors.status.success}
                  />
                  <Text className="text-sm font-semibold text-[#4CAF50] ml-1">
                    Vencedor: {jogo.time_vencedor.nome}
                  </Text>
                </View>
              )}

              {jogo.timing?.data_inicio && (
                <Text className="text-xs text-[#A0A4AB] italic text-center mt-3">
                  Iniciado: {new Date(jogo.timing.data_inicio).toLocaleString()}
                  {jogo.timing.duracao_minutos &&
                    ` • ${jogo.timing.duracao_minutos} min`}
                </Text>
              )}

              {jogo.status === "agendado" && !peladaFinalizada && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-[#4CAF50] py-3 rounded-md mt-4"
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
                      <Text className="text-sm font-semibold text-white ml-1">
                        Iniciar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {jogo.status === "em_andamento" && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md mt-4"
                  onPress={() =>
                    router.push(`/screens/PlacarJogo?jogoId=${jogo.id}`)
                  }
                >
                  <MaterialIcons
                    name="sports-volleyball"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text className="text-sm font-semibold text-white ml-1">
                    Controlar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Estatísticas dos Times */}
        {jogosData.times && jogosData.times.length > 0 && (
          <View className="bg-[#23262B] m-4 rounded-2xl p-4">
            <Text className="text-lg font-bold text-white mb-4">
              Estatísticas dos Times
            </Text>
            {jogosData.times.map((time) => (
              <View
                key={time.time_id}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="text-base font-semibold text-white">
                  {time.nome_time}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-[#2D6BFF] mx-1">
                    {time.vitorias}V
                  </Text>
                  <Text className="text-sm font-semibold text-[#2D6BFF] mx-1">
                    {time.derrotas}D
                  </Text>
                  <Text className="text-sm font-semibold text-[#2D6BFF] mx-1">
                    {time.pontos_marcados}P
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
