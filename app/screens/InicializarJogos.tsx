import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import JogosService, { TipoTorneio } from "@/services/api/jogos";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TipoTorneioOption {
  tipo: TipoTorneio;
  titulo: string;
  descricao: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  minTimes: number;
  maxTimes: number;
  temMetaPontos?: boolean;
}

const tiposTorneio: TipoTorneioOption[] = [
  {
    tipo: "jogo_unico",
    titulo: "Jogo Único",
    descricao: "Uma partida única entre os times",
    icon: "sports-volleyball",
    minTimes: 2,
    maxTimes: 2,
  },
  {
    tipo: "melhor_de_3",
    titulo: "Melhor de 3",
    descricao: "Série de até 3 jogos, primeiro a vencer 2 leva",
    icon: "filter-3",
    minTimes: 2,
    maxTimes: 2,
  },
  {
    tipo: "melhor_de_5",
    titulo: "Melhor de 5",
    descricao: "Série de até 5 jogos, primeiro a vencer 3 leva",
    icon: "filter-5",
    minTimes: 2,
    maxTimes: 2,
  },
  {
    tipo: "sequencial_continuo",
    titulo: "Sequencial Contínuo",
    descricao: "Jogos contínuos até atingir meta de pontos",
    icon: "repeat",
    minTimes: 2,
    maxTimes: 2,
    temMetaPontos: true,
  },
  {
    tipo: "eliminacao_rotativa",
    titulo: "Eliminação Rotativa",
    descricao: "Vencedor joga contra próximo time",
    icon: "rotate-right",
    minTimes: 3,
    maxTimes: 10,
  },
  {
    tipo: "round_robin",
    titulo: "Todos Contra Todos",
    descricao: "Cada time joga contra todos os outros",
    icon: "group-work",
    minTimes: 3,
    maxTimes: 10,
  },
];

export default function InicializarJogosScreen() {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoTorneio | null>(
    null
  );
  const [metaPontos, setMetaPontos] = useState("50");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { partidaId, quantidadeTimes } = useLocalSearchParams();

  const numeroTimes = parseInt(quantidadeTimes as string) || 2;

  console.log("🎮 InicializarJogos - Params:", {
    partidaId,
    quantidadeTimes,
    numeroTimes,
  });

  const getTiposDisponiveis = () => {
    return tiposTorneio.filter(
      (tipo) => numeroTimes >= tipo.minTimes && numeroTimes <= tipo.maxTimes
    );
  };

  const handleInicializar = async () => {
    if (!tipoSelecionado) {
      Alert.alert("Erro", "Selecione um tipo de torneio");
      return;
    }

    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }

    const tipoInfo = tiposTorneio.find((t) => t.tipo === tipoSelecionado);
    if (tipoInfo?.temMetaPontos && (!metaPontos || parseInt(metaPontos) < 1)) {
      Alert.alert("Erro", "Defina uma meta de pontos válida");
      return;
    }

    setLoading(true);
    try {
      const data: any = { tipo_torneio: tipoSelecionado };
      if (tipoInfo?.temMetaPontos) {
        data.meta_pontos = parseInt(metaPontos);
      }

      console.log(
        "🚀 InicializarJogos - Inicializando para partidaId:",
        partidaId,
        "com dados:",
        data
      );
      const response = await JogosService.inicializar(Number(partidaId), data);
      console.log("✅ InicializarJogos - Resposta da API:", response);

      Alert.alert("Sucesso!", "Sistema de jogos inicializado com sucesso", [
        {
          text: "OK",
          onPress: () => {
            // Navegar para a tela de gerenciar jogos
            router.replace(`/screens/GerenciarJogos?partidaId=${partidaId}`);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Erro ao inicializar jogos:", error);

      let mensagemErro = "Não foi possível inicializar o sistema de jogos.";

      if (error.response?.status === 400) {
        mensagemErro =
          "Dados inválidos. Verifique se há times suficientes para o tipo de torneio selecionado.";
      } else if (error.response?.status === 403) {
        mensagemErro = "Apenas administradores podem inicializar jogos.";
      } else if (error.response?.status === 404) {
        mensagemErro = "Partida não encontrada.";
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const renderTipoTorneio = (tipo: TipoTorneioOption) => {
    const isSelected = tipoSelecionado === tipo.tipo;

    return (
      <TouchableOpacity
        key={tipo.tipo}
        style={[styles.tipoCard, isSelected && styles.tipoCardSelected]}
        onPress={() => setTipoSelecionado(tipo.tipo)}
      >
        <View style={styles.tipoHeader}>
          <MaterialIcons
            name={tipo.icon}
            size={24}
            color={
              isSelected ? Theme.colors.primary : Theme.colors.text.secondary
            }
          />
          <Text
            style={[styles.tipoTitulo, isSelected && styles.tipoTituloSelected]}
          >
            {tipo.titulo}
          </Text>
        </View>
        <Text
          style={[
            styles.tipoDescricao,
            isSelected && styles.tipoDescricaoSelected,
          ]}
        >
          {tipo.descricao}
        </Text>
        {tipo.minTimes === tipo.maxTimes ? (
          <Text style={styles.tipoInfo}>Para {tipo.minTimes} times</Text>
        ) : (
          <Text style={styles.tipoInfo}>
            Para {tipo.minTimes}-{tipo.maxTimes} times
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const tipoSelecionadoInfo = tiposTorneio.find(
    (t) => t.tipo === tipoSelecionado
  );

  return (
    <ScreenLayout title="Inicializar Jogos" showBackButton scrollable={false}>
      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Configuração do Torneio</Text>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="group"
              size={20}
              color={Theme.colors.primary}
            />
            <Text style={styles.infoText}>{numeroTimes} times confirmados</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecione o Tipo de Torneio</Text>
          {getTiposDisponiveis().map(renderTipoTorneio)}
        </View>

        {tipoSelecionadoInfo?.temMetaPontos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meta de Pontos</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={metaPontos}
                onChangeText={setMetaPontos}
                keyboardType="numeric"
                placeholder="Ex: 50"
                placeholderTextColor={Theme.colors.text.secondary}
              />
              <Text style={styles.inputLabel}>pontos para vencer</Text>
            </View>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.inicializarButton,
              (!tipoSelecionado || loading) && styles.buttonDisabled,
            ]}
            onPress={handleInicializar}
            disabled={!tipoSelecionado || loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.text.primary} />
            ) : (
              <>
                <MaterialIcons
                  name="play-arrow"
                  size={20}
                  color={Theme.colors.text.primary}
                />
                <Text style={styles.buttonText}>Inicializar Jogos</Text>
              </>
            )}
          </TouchableOpacity>
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
  infoCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  infoTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
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
  tipoCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tipoCardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + "15",
  },
  tipoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  tipoTitulo: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  tipoTituloSelected: {
    color: Theme.colors.primary,
  },
  tipoDescricao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  tipoDescricaoSelected: {
    color: Theme.colors.text.primary,
  },
  tipoInfo: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.primary,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  input: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    minWidth: 80,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
  },
  actionContainer: {
    padding: Theme.spacing.lg,
  },
  inicializarButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
});
