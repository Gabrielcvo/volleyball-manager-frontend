import { formatDate, formatDuration } from "@/common/utils/formatters";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import {
  useConfirmacoesPartida,
  useConfirmarPresenca,
  usePartidaDetalhes,
} from "@/services/queries";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
  const [alterandoDecisao, setAlterandoDecisao] = useState(false); // Para controlar quando está alterando

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();
  const { user } = useAuth();

  const partidaIdNumero = Number(partidaId);

  // React Query hooks
  const {
    data: confirmacoes,
    isLoading: confirmandoLoading,
    refetch: refetchConfirmacoes,
    isFetching: refreshingConfirmacoes,
  } = useConfirmacoesPartida(partidaIdNumero);

  const {
    data: partidaDetalhes,
    isLoading: detalhesLoading,
    refetch: refetchDetalhes,
    isFetching: refreshingDetalhes,
  } = usePartidaDetalhes(partidaIdNumero);

  const confirmarPresencaMutation = useConfirmarPresenca();

  const loading = confirmandoLoading || detalhesLoading;
  const refreshing = refreshingConfirmacoes || refreshingDetalhes;

  // Verificar se o usuário é administrador do grupo
  const isAdmin = partidaDetalhes?.grupo?.meu_papel === "admin";

  const onRefresh = () => {
    refetchConfirmacoes();
    refetchDetalhes();
  };

  const handlePresencaPartida = async (
    status: "confirmado" | "nao_confirmado"
  ) => {
    if (!partidaId) return;

    try {
      await confirmarPresencaMutation.mutateAsync({
        partidaId: partidaIdNumero,
        status_presenca: status,
      });
      setAlterandoDecisao(false); // Resetar estado de alteração
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
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
  const handleIniciarJogos = () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }
    router.push(`/screens/InicializarJogos?partidaId=${partidaId}`);
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

          {partidaDetalhes?.valor_pelada && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="attach-money"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-3">
                R${" "}
                {typeof partidaDetalhes.valor_pelada === "number"
                  ? partidaDetalhes.valor_pelada.toFixed(2)
                  : Number(partidaDetalhes.valor_pelada).toFixed(2)}
              </Text>
            </View>
          )}

          {partidaDetalhes?.duracao_estimada_minutos && (
            <View className="flex-row items-center mb-2">
              <MaterialIcons
                name="schedule"
                size={20}
                color={Theme.colors.primary}
              />
              <Text className="text-base text-white ml-3">
                Duração:{" "}
                {formatDuration(partidaDetalhes.duracao_estimada_minutos)}
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
                disabled={confirmarPresencaMutation.isPending}
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

        {/* Sistema de Jogos */}
        {/* Admins: Controle completo quando há times | Todos: Visualização quando há jogos ativos/finalizados */}
        {(((partidaDetalhes?.times?.length || 0) >= 2 && isAdmin) ||
          partida.status === "finalizada" ||
          partida.status === "em_andamento") && (
          <View className="bg-[#23262B] mx-4 mb-4 rounded-xl p-4">
            <Text className="text-lg font-bold text-white mb-3">
              {isAdmin ? "Sistema de Jogos" : "Jogos da Partida"}
            </Text>

            {partida.status === "finalizada" ? (
              <Text className="text-sm text-[#A0A4AB] mb-3 text-center">
                Pelada finalizada - Visualize os resultados dos jogos
              </Text>
            ) : partida.status === "em_andamento" && !isAdmin ? (
              <Text className="text-sm text-[#A0A4AB] mb-3 text-center">
                Acompanhe o andamento dos jogos em tempo real
              </Text>
            ) : (
              <Text className="text-sm text-[#A0A4AB] mb-3 text-center">
                {partidaDetalhes?.times?.length || 0} times disponíveis para
                jogos sequenciais
              </Text>
            )}

            <View className="flex-row gap-3">
              {partida.status === "agendada" && isAdmin && (
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-[#28a745] py-3 rounded-md gap-2"
                  onPress={handleIniciarJogos}
                  disabled={confirmarPresencaMutation.isPending}
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
                disabled={confirmarPresencaMutation.isPending}
              >
                <MaterialIcons
                  name="sports-volleyball"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text className="text-base font-semibold text-white">
                  {partida.status === "finalizada"
                    ? "Ver Resultados"
                    : isAdmin
                      ? "Gerenciar Jogos"
                      : "Ver Jogos"}
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
                  disabled={confirmarPresencaMutation.isPending}
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
                  disabled={confirmarPresencaMutation.isPending}
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
                  disabled={confirmarPresencaMutation.isPending}
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
                    disabled={confirmarPresencaMutation.isPending}
                  >
                    {confirmarPresencaMutation.isPending ? (
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
                    disabled={confirmarPresencaMutation.isPending}
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
        {(partidaDetalhes?.times?.length || 0) > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Times ({partidaDetalhes?.times?.length || 0})
            </Text>
            {(partidaDetalhes?.times || []).map((time: any, index: number) => (
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
                  {time.jogador_time.map((jogador: any) => (
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
