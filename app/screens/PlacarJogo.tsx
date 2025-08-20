import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import JogosService, { ObterJogoResponse } from "@/services/api/jogos";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlacarJogoScreen() {
  const [jogoData, setJogoData] = useState<ObterJogoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placarTimeA, setPlacarTimeA] = useState(0);
  const [placarTimeB, setPlacarTimeB] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [salvandoPlacar, setSalvandoPlacar] = useState(false);
  const [finalizandoJogo, setFinalizandoJogo] = useState(false);
  const [placarAlterado, setPlacarAlterado] = useState(false);

  const router = useRouter();
  const { jogoId } = useLocalSearchParams();

  const loadJogo = useCallback(
    async (showLoading = true) => {
      if (!jogoId) return;

      try {
        if (showLoading) setLoading(true);
        const response = await JogosService.obterJogo(Number(jogoId));
        console.log("🎮 PlacarJogo - Dados recebidos:", response);
        console.log("🎮 PlacarJogo - Jogo:", response.jogo);
        console.log("🎮 PlacarJogo - Time A:", response.jogo?.times?.time_a);
        console.log("🎮 PlacarJogo - Time B:", response.jogo?.times?.time_b);

        setJogoData(response);
        setPlacarTimeA(response.jogo.placar?.time_a || 0);
        setPlacarTimeB(response.jogo.placar?.time_b || 0);
        setObservacoes(response.jogo.observacoes || "");
      } catch (error) {
        console.error("Erro ao carregar jogo:", error);
        console.log("❌ Erro: Não foi possível carregar o jogo");
        router.back();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jogoId, router]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadJogo(false);
  }, [loadJogo]);

  useEffect(() => {
    loadJogo();
  }, [loadJogo]);

  const handleSalvarPlacar = async () => {
    if (!jogoData?.jogo) return;

    try {
      setSalvandoPlacar(true);
      await JogosService.atualizarPontos(jogoData.jogo.id, {
        placar_time_a: placarTimeA,
        placar_time_b: placarTimeB,
      });

      setPlacarAlterado(false);
      console.log("✅ Placar salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar placar:", error);
      console.log("❌ Erro: Não foi possível salvar o placar");
    } finally {
      setSalvandoPlacar(false);
    }
  };

  const handleFinalizarJogo = async () => {
    if (!jogoData?.jogo) return;

    if (placarTimeA === placarTimeB) {
      console.log(
        "⚠️ Não é possível finalizar com empate. Defina um vencedor."
      );
      return;
    }

    // Se há alterações não salvas, salvar primeiro
    if (placarAlterado) {
      try {
        setSalvandoPlacar(true);
        await JogosService.atualizarPontos(jogoData!.jogo.id, {
          placar_time_a: placarTimeA,
          placar_time_b: placarTimeB,
        });
        setPlacarAlterado(false);
        console.log("✅ Placar salvo antes de finalizar");
      } catch (error) {
        console.error("Erro ao salvar placar:", error);
        console.log(
          "❌ Erro: Não foi possível salvar o placar antes de finalizar"
        );
        return;
      } finally {
        setSalvandoPlacar(false);
      }
    }

    confirmarFinalizarJogo();
  };

  const confirmarFinalizarJogo = async () => {
    console.log(
      `🏁 Confirmando finalização do jogo (${placarTimeA} x ${placarTimeB})`
    );
    setFinalizandoJogo(true);

    try {
      const response = await JogosService.finalizarJogo(jogoData!.jogo.id, {
        placar_time_a: placarTimeA,
        placar_time_b: placarTimeB,
        observacoes: observacoes.trim() || undefined,
      });

      console.log("✅ Jogo finalizado com sucesso:", response);

      // Navegar baseado na resposta
      if (response.serie_info?.status === "finalizada") {
        console.log(
          `🏆 Série finalizada! Vencedor: ${response.serie_info.vencedor_serie?.nome}`
        );
        router.replace(
          `/screens/GerenciarJogos?partidaId=${jogoData!.jogo.partida_id}`
        );
      } else {
        console.log(
          `🎯 Jogo finalizado! Vencedor: ${response.jogo.time_vencedor.nome}`
        );
        router.back();
      }
    } catch (error: any) {
      console.error("❌ Erro ao finalizar jogo:", error);

      // Log erro específico baseado no status
      if (error.response?.status === 400) {
        console.log("❌ Dados inválidos para finalizar o jogo");
      } else if (error.response?.status === 403) {
        console.log("❌ Sem permissão para finalizar o jogo");
      } else if (error.response?.status === 404) {
        console.log("❌ Jogo não encontrado");
      } else if (error.response?.status === 409) {
        console.log("❌ Jogo já foi finalizado anteriormente");
      } else if (error.response?.data?.message) {
        console.log("❌ Erro:", error.response.data.message);
      }
    } finally {
      setFinalizandoJogo(false);
    }
  };

  const incrementarPlacar = (time: "A" | "B") => {
    if (!jogoData?.jogo || jogoData.jogo.status === "finalizado") {
      return;
    }

    // Atualizar apenas localmente
    if (time === "A") {
      setPlacarTimeA((prev) => prev + 1);
    } else {
      setPlacarTimeB((prev) => prev + 1);
    }

    setPlacarAlterado(true);
  };

  const decrementarPlacar = (time: "A" | "B") => {
    if (!jogoData?.jogo || jogoData.jogo.status === "finalizado") {
      return;
    }

    // Não decrementar se já está em 0
    if (
      (time === "A" && placarTimeA <= 0) ||
      (time === "B" && placarTimeB <= 0)
    ) {
      return;
    }

    // Atualizar apenas localmente
    if (time === "A") {
      setPlacarTimeA((prev) => prev - 1);
    } else {
      setPlacarTimeB((prev) => prev - 1);
    }

    setPlacarAlterado(true);
  };

  const setPlacarDireto = (time: "A" | "B", valor: string) => {
    if (!jogoData?.jogo || jogoData.jogo.status === "finalizado") return;

    const numero = parseInt(valor) || 0;
    if (numero < 0) return;

    // Atualizar apenas localmente
    if (time === "A") {
      setPlacarTimeA(numero);
    } else {
      setPlacarTimeB(numero);
    }

    setPlacarAlterado(true);
  };

  if (
    loading ||
    !jogoData?.jogo ||
    !jogoData.jogo.times?.time_a ||
    !jogoData.jogo.times?.time_b
  ) {
    return (
      <ScreenLayout title="Carregando..." showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          {!loading &&
            jogoData?.jogo &&
            (!jogoData.jogo.times?.time_a || !jogoData.jogo.times?.time_b) && (
              <Text style={styles.errorText}>
                Dados do jogo incompletos. Tente novamente.
              </Text>
            )}
        </View>
      </ScreenLayout>
    );
  }

  const jogo = jogoData.jogo;
  // (removido: indicador alternativo de mudança de placar)
  const vencedorAtual =
    placarTimeA > placarTimeB
      ? jogo.times.time_a
      : placarTimeB > placarTimeA
      ? jogo.times.time_b
      : null;

  return (
    <ScreenLayout
      title={`Jogo ${jogo.numero_jogo}`}
      showBackButton
      scrollable={false}
    >
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
        {/* Status do Jogo */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status do Jogo</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    jogo.status === "em_andamento"
                      ? Theme.colors.primary
                      : jogo.status === "finalizado"
                      ? Theme.colors.status.success
                      : Theme.colors.status.warning,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {jogo.status === "em_andamento"
                  ? "Em Andamento"
                  : jogo.status === "finalizado"
                  ? "Finalizado"
                  : "Agendado"}
              </Text>
            </View>
          </View>

          {placarAlterado && (
            <View style={styles.placarAlteradoContainer}>
              <MaterialIcons
                name="edit"
                size={16}
                color={Theme.colors.status.warning}
              />
              <Text style={styles.placarAlteradoText}>
                Placar alterado - Salve ou finalize o jogo
              </Text>
            </View>
          )}

          {jogo.time_vencedor && (
            <View style={styles.vencedorContainer}>
              <MaterialIcons
                name="emoji-events"
                size={24}
                color={Theme.colors.status.success}
              />
              <Text style={styles.vencedorText}>
                Vencedor: {jogo.time_vencedor.nome}
              </Text>
            </View>
          )}
        </View>

        {/* Placar Principal */}
        <View style={styles.placarCard}>
          <Text style={styles.placarTitulo}>PLACAR</Text>

          {/* Time A */}
          <View style={styles.timeSection}>
            <Text style={styles.timeNome}>
              {jogo.times.time_a?.nome || "Time A"}
            </Text>
            <Text style={styles.timeJogadores}>
              {jogo.times.time_a?.jogadores?.length || 0} jogadores
            </Text>

            <View style={styles.placarControls}>
              <TouchableOpacity
                style={styles.botaoPlacar}
                onPress={() => decrementarPlacar("A")}
                disabled={jogo.status === "finalizado"}
              >
                <MaterialIcons name="remove" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <TextInput
                style={styles.placarInput}
                value={placarTimeA.toString()}
                onChangeText={(text) => setPlacarDireto("A", text)}
                keyboardType="numeric"
                editable={jogo.status !== "finalizado"}
              />

              <TouchableOpacity
                style={styles.botaoPlacar}
                onPress={() => incrementarPlacar("A")}
                disabled={jogo.status === "finalizado"}
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* VS Divider */}
          <View style={styles.versusContainer}>
            <Text style={styles.versusText}>VS</Text>
            {vencedorAtual && (
              <View style={styles.liderContainer}>
                <MaterialIcons
                  name="emoji-events"
                  size={16}
                  color={Theme.colors.status.success}
                />
                <Text style={styles.liderText}>
                  {vencedorAtual?.nome} na frente
                </Text>
              </View>
            )}
            {placarTimeA === placarTimeB && placarTimeA > 0 && (
              <Text style={styles.empateText}>⚖️ Empate</Text>
            )}
          </View>

          {/* Time B */}
          <View style={styles.timeSection}>
            <Text style={styles.timeNome}>
              {jogo.times.time_b?.nome || "Time B"}
            </Text>
            <Text style={styles.timeJogadores}>
              {jogo.times.time_b?.jogadores?.length || 0} jogadores
            </Text>

            <View style={styles.placarControls}>
              <TouchableOpacity
                style={styles.botaoPlacar}
                onPress={() => decrementarPlacar("B")}
                disabled={jogo.status === "finalizado"}
              >
                <MaterialIcons name="remove" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <TextInput
                style={styles.placarInput}
                value={placarTimeB.toString()}
                onChangeText={(text) => setPlacarDireto("B", text)}
                keyboardType="numeric"
                editable={jogo.status !== "finalizado"}
              />

              <TouchableOpacity
                style={styles.botaoPlacar}
                onPress={() => incrementarPlacar("B")}
                disabled={jogo.status === "finalizado"}
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Observações */}
        {jogo.status !== "finalizado" && (
          <View style={styles.observacoesCard}>
            <Text style={styles.observacoesLabel}>Observações (opcional)</Text>
            <TextInput
              style={styles.observacoesInput}
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Ex: Jogo equilibrado, muitas jogadas espetaculares..."
              placeholderTextColor={Theme.colors.text.secondary}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Ações */}
        {jogo.status !== "finalizado" && (
          <View style={styles.actionsContainer}>
            {placarAlterado && (
              <TouchableOpacity
                style={[styles.actionButton, styles.salvarButton]}
                onPress={handleSalvarPlacar}
                disabled={salvandoPlacar}
              >
                {salvandoPlacar ? (
                  <ActivityIndicator color={Theme.colors.text.primary} />
                ) : (
                  <>
                    <MaterialIcons
                      name="save"
                      size={20}
                      color={Theme.colors.text.primary}
                    />
                    <Text style={styles.actionButtonText}>Salvar Placar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.finalizarButton,
                (finalizandoJogo || placarTimeA === placarTimeB) &&
                  styles.actionButtonDisabled,
              ]}
              onPress={handleFinalizarJogo}
              disabled={finalizandoJogo || placarTimeA === placarTimeB}
            >
              {finalizandoJogo ? (
                <ActivityIndicator color={Theme.colors.text.primary} />
              ) : (
                <>
                  <MaterialIcons
                    name="flag"
                    size={20}
                    color={Theme.colors.text.primary}
                  />
                  <Text style={styles.actionButtonText}>
                    Finalizar Jogo
                    {placarTimeA === placarTimeB && " (Defina vencedor)"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {placarTimeA === placarTimeB && (
              <Text style={styles.empateAviso}>
                ⚠️ Não é possível finalizar com empate
              </Text>
            )}
          </View>
        )}

        {/* Times Detalhes */}
        <View style={styles.timesDetalhes}>
          <View style={styles.timeDetalhes}>
            <Text style={styles.timeDetalhesTitle}>
              {jogo.times.time_a?.nome || "Time A"}
            </Text>
            {(jogo.times.time_a?.jogadores || []).map((jogador) => (
              <Text key={jogador.id} style={styles.jogadorNome}>
                {jogador.nome}
              </Text>
            ))}
          </View>

          <View style={styles.timeDetalhes}>
            <Text style={styles.timeDetalhesTitle}>
              {jogo.times.time_b?.nome || "Time B"}
            </Text>
            {(jogo.times.time_b?.jogadores || []).map((jogador) => (
              <Text key={jogador.id} style={styles.jogadorNome}>
                {jogador.nome}
              </Text>
            ))}
          </View>
        </View>
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
  statusCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  statusTitle: {
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
  vencedorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.status.success + "20",
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  vencedorText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "bold",
    color: Theme.colors.status.success,
    marginLeft: Theme.spacing.sm,
  },
  placarCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.md, // Reduced margin for more space
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl, // Increased padding
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placarTitulo: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg, // Increased margin
    textAlign: "center",
  },
  timeSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: Theme.spacing.lg, // Increased margin between sections
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background + "50", // Subtle background
    borderRadius: Theme.borderRadius.md,
  },
  timeNome: {
    fontSize: Theme.fontSize.xl, // Increased font size
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  timeJogadores: {
    fontSize: Theme.fontSize.md, // Increased font size
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md, // Increased margin
  },
  placarControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Better distribution
    width: "90%", // Slightly narrower for better mobile layout
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
  },
  botaoPlacar: {
    backgroundColor: Theme.colors.primary,
    width: 70, // Larger touch area
    height: 70, // Larger touch area
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placarInput: {
    fontSize: 32, // Much larger font for better visibility
    fontWeight: "bold",
    color: Theme.colors.primary,
    textAlign: "center",
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minWidth: 120, // Wider input for easier typing
    borderWidth: 2,
    borderColor: Theme.colors.primary + "20",
  },
  versusContainer: {
    alignItems: "center",
    marginVertical: Theme.spacing.xl, // Increased vertical margin
    paddingVertical: Theme.spacing.md,
  },
  versusText: {
    fontSize: Theme.fontSize.xxl, // Larger VS text
    fontWeight: "bold",
    color: Theme.colors.text.secondary,
    letterSpacing: 4,
  },
  liderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.sm,
  },
  liderText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.status.success,
    fontWeight: "600",
    marginLeft: Theme.spacing.xs,
    textAlign: "center",
  },
  empateText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.status.warning,
    fontWeight: "600",
    marginTop: Theme.spacing.sm,
    textAlign: "center",
  },
  observacoesCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  observacoesLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  observacoesInput: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.primary,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    textAlignVertical: "top",
  },
  actionsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  salvarButton: {
    backgroundColor: Theme.colors.primary,
  },
  finalizarButton: {
    backgroundColor: Theme.colors.status.success,
  },
  actionButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
  avisoEmpate: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.status.warning,
    textAlign: "center",
    fontStyle: "italic",
  },
  timesDetalhes: {
    flexDirection: "row",
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  timeDetalhes: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  timeDetalhesTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  jogadorNome: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },
  errorText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.status.error,
    textAlign: "center",
    marginTop: Theme.spacing.md,
  },
  placarAlteradoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.status.warning + "20",
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  placarAlteradoText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.status.warning,
    fontWeight: "600",
  },
  empateAviso: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.status.warning,
    textAlign: "center",
    fontStyle: "italic",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});
