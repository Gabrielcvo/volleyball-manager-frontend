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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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

  // Recarregar dados quando a tela receber foco (ex: voltando de criar partida)
  useFocusEffect(
    useCallback(() => {
      if (grupo && activeTab === "partidas") {
        loadTabData("partidas");
      }
    }, [grupo, activeTab, loadTabData])
  );

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleCreatePartida = async () => {
    router.push({
      pathname: "/screens/CreatePartida",
      params: { groupId: groupId?.toString() },
    });
  };

  const handlePartidaPress = (partida: Partida) => {
    router.push({
      pathname: "/screens/PartidaDetails",
      params: { partidaId: partida.id.toString() },
    });
  };

  const isAdmin = grupo?.meu_papel === "admin";

  const renderPartidas = () => (
    <View className="p-4">
      {/* Botão Criar Nova Partida - sempre visível para admins */}
      {isAdmin && (
        <TouchableOpacity
          className="bg-[#23262B] rounded-2xl p-4 mb-4 flex-row items-center justify-center border-2 border-[#2D6BFF] border-solid"
          onPress={handleCreatePartida}
        >
          <MaterialIcons name="add" size={24} color={Theme.colors.primary} />
          <Text className="text-base font-semibold text-[#2D6BFF] ml-3">
            {partidas.length === 0 ? "Criar Primeira Partida" : "Nova Partida"}
          </Text>
        </TouchableOpacity>
      )}

      {partidas.length === 0 ? (
        <View className="items-center p-8">
          <MaterialIcons
            name="sports-volleyball"
            size={48}
            color={Theme.colors.text.secondary}
          />
          <Text className="text-base text-[#A0A4AB] mt-4 mb-4">
            Nenhuma partida criada ainda
          </Text>
        </View>
      ) : (
        partidas.map((partida) => (
          <TouchableOpacity
            key={partida.id}
            className="bg-[#23262B] rounded-2xl p-4 mb-3 flex-row items-center"
            onPress={() => handlePartidaPress(partida)}
          >
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white mb-1">
                {formatDate(partida.data_hora)}
              </Text>
              {partida.local && (
                <Text className="text-sm text-[#A0A4AB] mb-3">
                  {partida.local}
                </Text>
              )}
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-[#A0A4AB]">
                  {partida.confirmados || 0}/{partida.limite_jogadores}{" "}
                  confirmados
                </Text>
                <View
                  className="px-3 py-1 rounded-md"
                  style={{ backgroundColor: getStatusColor(partida.status) }}
                >
                  <Text className="text-xs font-semibold text-white">
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
    <View className="p-4">
      {membros.map((membro) => (
        <View
          key={membro.id}
          className="bg-[#23262B] rounded-2xl p-4 mb-3 flex-row items-center"
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-semibold text-white flex-1">
                {membro.nome}
              </Text>
              {membro.papel === "admin" && (
                <MaterialIcons
                  name="admin-panel-settings"
                  size={16}
                  color={Theme.colors.primary}
                />
              )}
            </View>
            <Text className="text-sm text-[#A0A4AB] mb-1">{membro.email}</Text>
            {membro.posicao_preferida && (
              <Text className="text-sm text-[#2D6BFF] mb-3">
                {membro.posicao_preferida}
              </Text>
            )}
            <View className="flex-row gap-4">
              <Text className="text-xs text-[#A0A4AB]">
                Overall: {formatNumber(membro.overall)}
              </Text>
              {membro.assiduidade && (
                <Text className="text-xs text-[#A0A4AB]">
                  Assiduidade: {formatPercentage(membro.assiduidade)}
                </Text>
              )}
            </View>
          </View>
          {isAdmin && membro.id !== user?.id && (
            <TouchableOpacity className="p-3">
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
        <TouchableOpacity className="bg-[#23262B] rounded-2xl p-4 flex-row items-center justify-center border-2 border-[#2D6BFF] border-dashed">
          <MaterialIcons
            name="person-add"
            size={24}
            color={Theme.colors.primary}
          />
          <Text className="text-base font-semibold text-[#2D6BFF] ml-3">
            Adicionar Membro
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRanking = () => (
    <View className="p-4">
      {ranking.map((item) => (
        <View
          key={item.jogador.id}
          className="bg-[#23262B] rounded-2xl p-4 mb-3 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-xl bg-[#2D6BFF] items-center justify-center mr-4">
            <Text className="text-base font-bold text-white">
              {item.posicao}º
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-white mb-1">
              {item.jogador.nome}
            </Text>
            <Text className="text-sm text-[#2D6BFF] mb-1">
              Overall: {formatNumber(item.jogador.overall)}
            </Text>
            <View className="flex-row gap-4">
              <Text className="text-xs text-[#A0A4AB]">
                Assiduidade:{" "}
                {formatPercentage(item.estatisticas_grupo.assiduidade)}
              </Text>
              <Text className="text-xs text-[#A0A4AB]">
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
        <View className="flex-1 justify-center items-center p-8">
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
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={grupo.nome} showBackButton scrollable={false}>
      <View className="flex-1 bg-[#1A1D21]">
        {/* Header Info */}
        <View className="p-4 border-b border-[#2A2D31]">
          {grupo.descricao && (
            <Text className="text-base text-[#A0A4AB] leading-5 mb-4">
              {grupo.descricao}
            </Text>
          )}

          <View className="flex-row flex-wrap gap-4">
            {grupo.localizacao && (
              <View className="flex-row items-center">
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={Theme.colors.text.secondary}
                />
                <Text className="text-sm text-[#A0A4AB] ml-1">
                  {grupo.localizacao}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <MaterialIcons
                name="group"
                size={16}
                color={Theme.colors.text.secondary}
              />
              <Text className="text-sm text-[#A0A4AB] ml-1">
                {grupo.total_membros || 0} membros
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons
                name="sports-volleyball"
                size={16}
                color={Theme.colors.text.secondary}
              />
              <Text className="text-sm text-[#A0A4AB] ml-1">
                {grupo.total_partidas || 0} partidas
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-[#23262B]">
          {(["partidas", "membros", "ranking"] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 items-center ${activeTab === tab ? "border-b-2 border-[#2D6BFF]" : ""}`}
              onPress={() => handleTabPress(tab)}
            >
              <Text
                className={`text-base font-medium ${activeTab === tab ? "text-[#2D6BFF] font-semibold" : "text-[#A0A4AB]"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}
