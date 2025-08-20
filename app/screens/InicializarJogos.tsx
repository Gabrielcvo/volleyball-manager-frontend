import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import PartidasService from "@/services/api/partidas";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Tela simplificada: apenas iniciar pelada

export default function InicializarJogosScreen() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { partidaId, quantidadeTimes } = useLocalSearchParams();

  console.log("🎮 InicializarJogos - Params:", {
    partidaId,
    quantidadeTimes,
  });

  const handleInicializar = async () => {
    if (!partidaId) {
      Alert.alert("Erro", "ID da partida não encontrado");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // (Fluxo antigo removido)

  return (
    <ScreenLayout title="Inicializar Jogos" showBackButton scrollable={false}>
      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pelada Sequencial</Text>
          <Text style={styles.infoText}>
            Inicie a pelada para esta partida. Você poderá criar jogos
            sequenciais escolhendo os times manualmente.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.inicializarButton, loading && styles.buttonDisabled]}
            onPress={handleInicializar}
            disabled={loading}
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
                <Text style={styles.buttonText}>Iniciar Pelada</Text>
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
