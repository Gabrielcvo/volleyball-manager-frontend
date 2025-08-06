import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import PartidasService, {
  ConfirmacoesPartida,
  PartidaDetalhes,
} from "@/services/api/partidas";
import TimesService, { MetodoSorteio, Time } from "@/services/api/times";
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

export default function SortearTimesScreen() {
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacoesPartida | null>(
    null
  );
  const [partidaDetalhes, setPartidaDetalhes] =
    useState<PartidaDetalhes | null>(null);
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [metodoSelecionado, setMetodoSelecionado] =
    useState<MetodoSorteio>("overall");

  const router = useRouter();
  const { partidaId } = useLocalSearchParams();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    if (!partidaId) {
      console.log("Erro: ID da partida não foi fornecido");
      router.back();
      return;
    }

    const partidaIdNumero = Number(partidaId);
    if (isNaN(partidaIdNumero) || partidaIdNumero <= 0) {
      console.log("Erro: ID da partida inválido");
      router.back();
      return;
    }

    try {
      setLoading(true);

      // Carregar detalhes da partida e confirmações em paralelo
      const [detalhesResponse, confirmacaoResponse] = await Promise.all([
        PartidasService.getDetalhes(partidaIdNumero),
        PartidasService.getConfirmacoes(partidaIdNumero),
      ]);

      if (!detalhesResponse || !detalhesResponse.partida) {
        console.log("Erro: Resposta inválida do servidor (detalhes)");
        throw new Error("Resposta inválida do servidor");
      }

      if (!confirmacaoResponse || !confirmacaoResponse.partida) {
        console.log("Erro: Resposta inválida do servidor (confirmações)");
        throw new Error("Resposta inválida do servidor");
      }

      setPartidaDetalhes(detalhesResponse);
      setConfirmacoes(confirmacaoResponse);

      // Tentar carregar times existentes
      try {
        const timesResponse = await TimesService.listar(partidaIdNumero);
        setTimes(timesResponse.times || []);
      } catch (error) {
        // Se não há times ainda, não é erro
        console.log("Nenhum time encontrado para a partida");
        setTimes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      // Verificar o tipo de erro
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          console.log("Erro: Partida não encontrada");
        } else if (axiosError.response?.status === 401) {
          console.log("Erro: Sessão expirada. Faça login novamente.");
        } else if (axiosError.response?.status === 403) {
          console.log("Erro: Você não tem permissão para acessar esta partida");
        } else if (axiosError.response?.data?.message) {
          console.log("Erro:", axiosError.response.data.message);
        } else {
          console.log("Erro: Não foi possível carregar os dados da partida");
        }
      } else {
        console.log("Erro: Não foi possível carregar os dados da partida");
      }

      router.back();
    } finally {
      setLoading(false);
    }
  }, [partidaId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSortearTimes = async () => {
    // Validações básicas
    if (!partidaId) {
      console.log("Erro: ID da partida não fornecido");
      return;
    }

    if (!user) {
      console.log("Erro: Usuário não está logado");
      return;
    }

    if (!confirmacoes || !partidaDetalhes) {
      console.log("Erro: Dados da partida não carregados");
      return;
    }

    const partidaIdNumero = Number(partidaId);
    if (isNaN(partidaIdNumero) || partidaIdNumero <= 0) {
      console.log("Erro: ID da partida inválido");
      return;
    }

    // Validar se a partida está agendada
    if (confirmacoes.partida.status !== "agendada") {
      console.log("Erro: Só é possível sortear times para partidas agendadas");
      return;
    }

    // Validar número mínimo de jogadores
    if (confirmacoes.confirmados.length < 2) {
      console.log(
        "Erro: É necessário pelo menos 2 jogadores confirmados para sortear times"
      );
      return;
    }

    // Validar número máximo de jogadores (opcional)
    const maxJogadores = confirmacoes.partida.limite_jogadores || 20;
    if (confirmacoes.confirmados.length > maxJogadores) {
      console.log(
        `Aviso: Muitos jogadores confirmados (${confirmacoes.confirmados.length}/${maxJogadores}). O sorteio pode não ser ideal.`
      );
    }

    // Validar método de sorteio
    if (!metodoSelecionado) {
      console.log("Erro: Selecione um método de sorteio");
      return;
    }

    // Validar se há jogadores com overall para método overall
    if (metodoSelecionado === "overall") {
      const jogadoresSemOverall = confirmacoes.confirmados.filter(
        (jogador) => !jogador.jogador.overall || jogador.jogador.overall <= 0
      );

      if (jogadoresSemOverall.length > 0) {
        console.log(
          `Aviso: ${jogadoresSemOverall.length} jogador(es) não têm overall definido. O sorteio pode não ser balanceado.`
        );
      }
    }

    // Validar se há jogadores com posição para método posição
    if (metodoSelecionado === "posicao") {
      const jogadoresSemPosicao = confirmacoes.confirmados.filter(
        (jogador) => !jogador.jogador.posicao_preferida
      );

      if (jogadoresSemPosicao.length > 0) {
        console.log(
          `Aviso: ${jogadoresSemPosicao.length} jogador(es) não têm posição preferida definida.`
        );
      }
    }

    console.log(confirmacoes, " confirmações");
    console.log(partidaDetalhes, " detalhes da partida");

    // Validar permissão de administrador usando os detalhes da partida
    const isAdmin = partidaDetalhes?.partida.grupo?.meu_papel === "admin";
    console.log(
      "Meu papel no grupo:",
      partidaDetalhes?.partida.grupo?.meu_papel
    );
    console.log("Usuário logado:", user?.id);

    if (!isAdmin) {
      console.log("Erro: Apenas administradores do grupo podem sortear times");
      return;
    }

    // Verificar se já existem times
    if (times.length > 0) {
      console.log("Aviso: Já existem times sorteados. Substituindo...");
      // Executar sorteio diretamente
      setSorteando(true);
      try {
        const response = await TimesService.sortear(Number(partidaId), {
          metodo: metodoSelecionado,
          num_times: 2, // Sempre 2 times para vôlei
          jogadores_selecionados: confirmacoes.confirmados.map(
            (c) => c.jogador.id
          ),
        });

        // Validar resposta do servidor
        if (!response) {
          throw new Error("Resposta vazia do servidor");
        }

        if (!response.times || !Array.isArray(response.times)) {
          throw new Error("Formato de resposta inválido");
        }

        if (response.times.length === 0) {
          throw new Error("Nenhum time foi criado");
        }

        // Validar se todos os times têm jogadores
        const timesSemJogadores = response.times.filter(
          (time) => !time.jogadores || time.jogadores.length === 0
        );

        if (timesSemJogadores.length > 0) {
          throw new Error("Alguns times foram criados sem jogadores");
        }

        setTimes(response.times);
        console.log("Sucesso: Times sorteados com sucesso!");
      } catch (error) {
        console.error("Erro ao sortear times:", error);

        // Verificar o tipo de erro
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 404) {
            console.log(
              "Erro: Funcionalidade de sorteio ainda não está implementada no servidor."
            );
          } else if (
            axiosError.response?.status === 401 ||
            axiosError.response?.status === 403
          ) {
            console.log(
              "Erro: Apenas administradores do grupo podem sortear times."
            );
          } else if (axiosError.response?.data?.message) {
            console.log("Erro:", axiosError.response.data.message);
          } else {
            console.log(
              "Erro de Conexão:",
              `Erro HTTP ${axiosError.response?.status || "desconhecido"}`
            );
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(
            "Erro:",
            `Não foi possível conectar com o servidor: ${errorMessage}`
          );
        }
      } finally {
        setSorteando(false);
      }
    } else {
      console.log("Iniciando sorteio de times...");
      // Executar sorteio diretamente
      setSorteando(true);
      try {
        const response = await TimesService.sortear(Number(partidaId), {
          metodo: metodoSelecionado,
          num_times: 2, // Sempre 2 times para vôlei
          jogadores_selecionados: confirmacoes.confirmados.map(
            (c) => c.jogador.id
          ),
        });

        // Validar resposta do servidor
        if (!response) {
          throw new Error("Resposta vazia do servidor");
        }

        if (!response.times || !Array.isArray(response.times)) {
          throw new Error("Formato de resposta inválido");
        }

        if (response.times.length === 0) {
          throw new Error("Nenhum time foi criado");
        }

        // Validar se todos os times têm jogadores
        const timesSemJogadores = response.times.filter(
          (time) => !time.jogadores || time.jogadores.length === 0
        );

        if (timesSemJogadores.length > 0) {
          throw new Error("Alguns times foram criados sem jogadores");
        }

        setTimes(response.times);
        console.log("Sucesso: Times sorteados com sucesso!");
      } catch (error) {
        console.error("Erro ao sortear times:", error);

        // Verificar o tipo de erro
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 404) {
            console.log(
              "Erro: Funcionalidade de sorteio ainda não está implementada no servidor."
            );
          } else if (
            axiosError.response?.status === 401 ||
            axiosError.response?.status === 403
          ) {
            console.log(
              "Erro: Apenas administradores do grupo podem sortear times."
            );
          } else if (axiosError.response?.data?.message) {
            console.log("Erro:", axiosError.response.data.message);
          } else {
            console.log(
              "Erro de Conexão:",
              `Erro HTTP ${axiosError.response?.status || "desconhecido"}`
            );
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(
            "Erro:",
            `Não foi possível conectar com o servidor: ${errorMessage}`
          );
        }
      } finally {
        setSorteando(false);
      }
    }
    setSorteando(true);
    try {
      const response = await TimesService.sortear(Number(partidaId), {
        metodo: metodoSelecionado,
        num_times: 2, // Sempre 2 times para vôlei
        jogadores_selecionados: confirmacoes.confirmados.map(
          (c) => c.jogador.id
        ),
      });

      // Validar resposta do servidor
      if (!response) {
        throw new Error("Resposta vazia do servidor");
      }

      if (!response.times || !Array.isArray(response.times)) {
        throw new Error("Formato de resposta inválido");
      }

      if (response.times.length === 0) {
        throw new Error("Nenhum time foi criado");
      }

      // Validar se todos os times têm jogadores
      const timesSemJogadores = response.times.filter(
        (time) => !time.jogadores || time.jogadores.length === 0
      );

      if (timesSemJogadores.length > 0) {
        throw new Error("Alguns times foram criados sem jogadores");
      }

      setTimes(response.times);
      Alert.alert(
        "Sucesso",
        response.message || "Times sorteados com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao sortear times:", error);

      // Verificar o tipo de erro
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          Alert.alert(
            "Funcionalidade Indisponível",
            "A funcionalidade de sorteio ainda não está implementada no servidor."
          );
        } else if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          Alert.alert(
            "Sem Permissão",
            "Apenas administradores do grupo podem sortear times. Verifique se você tem as permissões necessárias."
          );
        } else if (axiosError.response?.data?.message) {
          Alert.alert("Erro", axiosError.response.data.message);
        } else {
          Alert.alert(
            "Erro de Conexão",
            `Erro HTTP ${
              axiosError.response?.status || "desconhecido"
            }. Verifique sua conexão e tente novamente.`
          );
        }
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        Alert.alert(
          "Erro",
          `Não foi possível conectar com o servidor: ${errorMessage}`
        );
      }
    } finally {
      setSorteando(false);
    }
  };

  const getMetodoNome = (metodo: MetodoSorteio) => {
    switch (metodo) {
      case "overall":
        return "Overall (Balanceado)";
      case "posicao":
        return "Por Posição";
      case "aleatorio":
        return "Aleatório";
      default:
        return metodo;
    }
  };

  const getMetodoDescricao = (metodo: MetodoSorteio) => {
    switch (metodo) {
      case "overall":
        return "Distribui jogadores balanceando o overall médio dos times";
      case "posicao":
        return "Distribui jogadores considerando suas posições preferenciais";
      case "aleatorio":
        return "Distribui jogadores de forma completamente aleatória";
      default:
        return "";
    }
  };

  const renderTime = (time: Time) => (
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
        {time.jogadores?.map((jogador) => (
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

  if (loading) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
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
            {(["overall", "posicao", "aleatorio"] as MetodoSorteio[]).map(
              (metodo) => (
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
              )
            )}
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
              sorteando && styles.sortearButtonDisabled,
            ]}
            onPress={handleSortearTimes}
            disabled={
              sorteando || !confirmacoes || confirmacoes.confirmados.length < 2
            }
          >
            {sorteando ? (
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
                      pathname: "/screens/Pontuacao",
                      params: { partidaId: partidaId?.toString() },
                    })
                  }
                >
                  <MaterialIcons
                    name="score"
                    size={16}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Pontuação</Text>
                </TouchableOpacity>

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
