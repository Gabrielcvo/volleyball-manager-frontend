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
      className={`bg-[#23262B] rounded-md p-3 mb-2 flex-row items-center ${
        isFilaEspera ? "border-l-4 border-l-[#f59e0b]" : ""
      } ${
        isCancelado
          ? "border-l-4 border-l-[#dc3545] opacity-70 bg-[#181B20]"
          : ""
      }`}
    >
      <View className="flex-1">
        <Text
          className={`text-base font-semibold text-white mb-0.5 ${
            isCancelado ? "text-[#A0A4AB] line-through" : ""
          }`}
        >
          {item.jogador.nome}
        </Text>
        {item.jogador.posicao_preferida && (
          <Text
            className={`text-sm text-[#2D6BFF] mb-0.5 ${
              isCancelado ? "text-[#A0A4AB] line-through" : ""
            }`}
          >
            {item.jogador.posicao_preferida}
          </Text>
        )}
        <Text
          className={`text-xs text-[#A0A4AB] ${
            isCancelado ? "text-[#A0A4AB] line-through" : ""
          }`}
        >
          Overall: {item.jogador.overall}
        </Text>
      </View>
      {isFilaEspera && (
        <View className="bg-[#f59e0b] px-3 py-1 rounded-md">
          <Text className="text-xs font-semibold text-white">Fila</Text>
        </View>
      )}
      {isCancelado && (
        <View className="flex-row items-center bg-[#dc3545] px-3 py-1 rounded-md gap-1">
          <MaterialIcons
            name="cancel"
            size={20}
            color={Theme.colors.status.error}
          />
          <Text className="text-xs font-semibold text-white">Cancelou</Text>
        </View>
      )}
    </View>
  );

  if (loading || !confirmacoes) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View className="flex-1 justify-center items-center p-5">
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
        className="flex-1 bg-[#181B20]"
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
        <View className="bg-[#23262B] m-4 rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-white">
              Informações da Partida
            </Text>
            <View
              className={`px-3 py-1 rounded-md`}
              style={{ backgroundColor: getStatusColor(partida.status) }}
            >
              <Text className="text-xs font-semibold text-white">
                {getStatusText(partida.status)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-2">
            <MaterialIcons
              name="event"
              size={20}
              color={Theme.colors.primary}
            />
            <Text className="text-base text-white ml-3">
              {formatDate(partida.data_hora)}
            </Text>
          </View>

          {partida.local && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="location-on"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-3">{partida.local}</Text>
            </View>
          )}

          <View className="flex-row items-center mb-2">
            <MaterialIcons
              name="group"
              size={20}
              color={Theme.colors.primary}
            />
            <Text className="text-base text-white ml-3">
              {/* {confirmacoes.confirmados?.length || 0}/{partida.limite_jogadores}{" "} */}
              confirmados
            </Text>
          </View>

          {partidaDetalhes?.partida.valor_pelada && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="attach-money"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-3">
                R${" "}
                {typeof partidaDetalhes.partida.valor_pelada === "number"
                  ? partidaDetalhes.partida.valor_pelada.toFixed(2)
                  : Number(partidaDetalhes.partida.valor_pelada).toFixed(2)}
              </Text>
            </View>
          )}

          {partidaDetalhes?.partida.duracao_estimada_minutos && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="schedule"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-3">
                Duração:{" "}
                {formatDuration(
                  partidaDetalhes.partida.duracao_estimada_minutos
                )}
              </Text>
            </View>
          )}

          {(confirmacoes.fila_espera?.length || 0) > 0 && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="queue"
                size={20}
                color={Theme.colors.status.warning}
              />
              <Text className="text-base text-white ml-3">
                {/* {confirmacoes.fila_espera?.length || 0} na fila de espera */}
              </Text>
            </View>
          )}

          {(confirmacoes.naoComparecer?.length || 0) > 0 && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="cancel"
                size={20}
                color={Theme.colors.status.error}
              />
              <Text className="text-base text-white ml-3">
                {/* {confirmacoes.naoComparecer?.length || 0} não participarão */}
              </Text>
            </View>
          )}
        </View>

        {/* Sorteio de Times - Apenas para Admins */}
        {partida.status === "agendada" &&
          (confirmacoes.confirmados?.length || 0) >= 2 &&
          isAdmin && (
            <View className="bg-[#23262B] mx-4 mb-4 rounded-xl p-4">
              <Text className="text-lg font-bold text-white mb-3">
                Sorteio de Times
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md gap-2"
                onPress={handleSortearTimes}
                disabled={confirmingPresence}
              >
                <MaterialIcons
                  name="shuffle"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text className="text-base font-semibold text-white">
                  Sortear Times
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Sistema de Jogos - Admins */}
        {(partida.status === "agendada" || partida.status === "em_andamento") &&
          (partidaDetalhes?.partida.times?.length || 0) >= 2 &&
          isAdmin && (
            <View className="bg-[#23262B] mx-4 mb-4 rounded-xl p-4">
              <Text className="text-lg font-bold text-white mb-3">
                Sistema de Jogos
              </Text>
              <Text className="text-sm text-[#A0A4AB] mb-3 text-center">
                {partidaDetalhes?.partida.times?.length || 0} times disponíveis
                para jogos sequenciais
              </Text>

              <View className="flex-row gap-3">
                {partida.status === "agendada" && (
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#28a745] py-3 rounded-md gap-2"
                    onPress={handleIniciarJogos}
                    disabled={confirmingPresence}
                  >
                    <MaterialIcons
                      name="play-arrow"
                      size={20}
                      color={Theme.colors.text.primary}
                    />
                    <Text className="text-base font-semibold text-white">
                      Iniciar Pelada
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-[#2D6BFF] py-3 rounded-md gap-2"
                  onPress={handleGerenciarJogos}
                  disabled={confirmingPresence}
                >
                  <MaterialIcons
                    name="sports-volleyball"
                    size={20}
                    color={Theme.colors.text.primary}
                  />
                  <Text className="text-base font-semibold text-white">
                    Ver Jogos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Botões de Ação */}
        {partida.status === "agendada" && (
          <View className="bg-[#23262B] mx-4 mb-4 rounded-xl p-4">
            <Text className="text-lg font-bold text-white mb-3">
              Sua Confirmação
            </Text>

            {myStatus === "confirmado" && (
              <View className="flex-row items-center justify-between mb-3 p-2 bg-[#181B20] rounded-md">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={Theme.colors.status.success}
                  />
                  <Text className="text-base text-white ml-3 font-medium">
                    Irei participar
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-3 py-2 bg-[#dc3545] rounded-md"
                  onPress={() => handleResetarDecisao()}
                  disabled={confirmingPresence}
                >
                  <Text className="text-sm font-semibold text-white">
                    Alterar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "nao_confirmado" && (
              <View className="flex-row items-center justify-between mb-3 p-2 bg-[#181B20] rounded-md">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons
                    name="cancel"
                    size={24}
                    color={Theme.colors.status.error}
                  />
                  <Text className="text-base text-white ml-3 font-medium">
                    Não irei participar
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-3 py-2 bg-[#dc3545] rounded-md"
                  onPress={() => handleResetarDecisao()}
                  disabled={confirmingPresence}
                >
                  <Text className="text-sm font-semibold text-white">
                    Alterar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "fila_espera" && (
              <View className="flex-row items-center justify-between mb-3 p-2 bg-[#181B20] rounded-md">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons
                    name="queue"
                    size={24}
                    color={Theme.colors.status.warning}
                  />
                  <Text className="text-base text-white ml-3 font-medium">
                    Você está na fila de espera
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-3 py-2 bg-[#dc3545] rounded-md"
                  onPress={() => handlePresencaPartida("nao_confirmado")}
                  disabled={confirmingPresence}
                >
                  <Text className="text-sm font-semibold text-white">
                    Sair da fila
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {myStatus === "nao_respondido" && (
              <>
                {alterandoDecisao && (
                  <View className="bg-[#181B20] p-3 rounded-md mb-3 border border-[#2D6BFF]">
                    <Text className="text-base font-semibold text-[#2D6BFF] text-center mb-2">
                      Escolha sua nova decisão:
                    </Text>
                    <TouchableOpacity
                      className="self-center px-3 py-2"
                      onPress={() => setAlterandoDecisao(false)}
                    >
                      <Text className="text-sm text-[#A0A4AB] underline">
                        Manter decisão anterior
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#28a745] py-3 rounded-md gap-2"
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
                        <Text className="text-base font-semibold text-white">
                          Confirmar
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-[#dc3545] py-3 rounded-md gap-2"
                    onPress={() => handlePresencaPartida("nao_confirmado")}
                    disabled={confirmingPresence}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={Theme.colors.text.primary}
                    />
                    <Text className="text-base font-semibold text-white">
                      Não participar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Lista de Confirmados */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-white mb-3">
            Confirmados ({confirmacoes.confirmados?.length || 0})
          </Text>
          {(confirmacoes.confirmados?.length || 0) === 0 ? (
            <View className="items-center p-5 bg-[#23262B] rounded-xl">
              <MaterialIcons
                name="group"
                size={48}
                color={Theme.colors.text.secondary}
              />
              <Text className="text-base text-[#A0A4AB] mt-3">
                Nenhum jogador confirmado ainda
              </Text>
            </View>
          ) : (
            (confirmacoes.confirmados || []).map((item) => renderJogador(item))
          )}
        </View>

        {/* Lista de Fila de Espera */}
        {(confirmacoes.fila_espera?.length || 0) > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Fila de Espera ({confirmacoes.fila_espera?.length || 0})
            </Text>
            {(confirmacoes.fila_espera || []).map((item) =>
              renderJogador(item, true)
            )}
          </View>
        )}

        {/* Lista de Jogadores que Cancelaram */}
        {(confirmacoes.naoComparecer?.length || 0) > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Não Participarão ({confirmacoes.naoComparecer?.length || 0})
            </Text>
            {(confirmacoes.naoComparecer || []).map((item) =>
              renderJogador(item, false, true)
            )}
          </View>
        )}

        {/* Times da Partida */}
        {(partidaDetalhes?.partida.times?.length || 0) > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Times ({partidaDetalhes?.partida.times?.length || 0})
            </Text>
            {(partidaDetalhes?.partida.times || []).map((time, index) => (
              <View key={time.id} className="bg-[#23262B] rounded-md p-3 mb-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-white">
                    {time.nome_time}
                  </Text>
                  <View className="bg-[#2D6BFF] px-3 py-1 rounded-md">
                    <Text className="text-sm font-semibold text-white">
                      {time.pontuacao_final} pts
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 mb-2">
                  <Text className="text-sm text-[#A0A4AB]">
                    {time.total_jogadores || time.jogador_time.length} jogadores
                  </Text>
                  {time.overall_medio && (
                    <Text className="text-sm text-[#A0A4AB]">
                      Overall médio: {time.overall_medio}
                    </Text>
                  )}
                </View>

                <View className="gap-1">
                  {time.jogador_time.map((jogador) => (
                    <View
                      key={jogador.jogador.id}
                      className="flex-row items-center py-1 px-2 bg-[#181B20] rounded-md"
                    >
                      <Text className="text-sm font-medium text-white flex-1">
                        {jogador.jogador.usuario.nome}
                      </Text>
                      {jogador.posicao_jogada && (
                        <Text className="text-xs text-[#2D6BFF] mx-2">
                          {jogador.posicao_jogada}
                        </Text>
                      )}
                      <Text className="text-xs text-[#A0A4AB]">
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
