import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const jogos = [
  {
    id: "1",
    tipo: "Vôlei de Praia",
    local: "Praia de Copacabana",
    data: "20/07/2024",
    horario: "15:00 - 17:00",
    criador: "Você",
  },
  {
    id: "2",
    tipo: "Vôlei Indoor",
    local: "Quadra de Ibirapuera",
    data: "21/07/2024",
    horario: "10:00 - 12:00",
    criador: "Maria",
  },
];

export default function JogosScreen() {
  const router = useRouter();

  function irParaCadastro() {
    router.push("/screens/CreateGame");
  }

  function irParaDetalhes(jogoId: string) {
    router.push({ pathname: "/screens/GameDetails", params: { id: jogoId } });
  }

  const headerRightElement = (
    <TouchableOpacity style={styles.cadastrarButton} onPress={irParaCadastro}>
      <Text style={styles.cadastrarButtonText}>+</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      title="Jogos"
      headerRightElement={headerRightElement}
      scrollable
    >
      <View style={styles.container}>
        <FlatList
          data={jogos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.jogoItem}
              onPress={() => irParaDetalhes(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.tipo}>{item.tipo}</Text>
                <Text style={styles.local}>{item.local}</Text>
                <Text style={styles.data}>
                  {item.data} - {item.horario}
                </Text>
                <Text style={styles.criador}>Criador: {item.criador}</Text>
              </View>
              {item.criador === "Você" && (
                <TouchableOpacity
                  style={styles.gerenciarButton}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/GameDetails",
                      params: { id: item.id, gerenciar: "1" },
                    })
                  }
                >
                  <Text style={styles.gerenciarButtonText}>Gerenciar</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
  },
  cadastrarButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xxl,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cadastrarButtonText: {
    color: Theme.colors.text.primary,
    fontSize: Theme.fontSize.xxl,
    fontWeight: "bold",
  },
  jogoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  tipo: {
    color: Theme.colors.text.secondary,
    fontSize: Theme.fontSize.sm,
    fontWeight: "600",
  },
  local: {
    color: Theme.colors.text.primary,
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    marginTop: 2,
  },
  data: {
    color: Theme.colors.text.secondary,
    fontSize: Theme.fontSize.sm,
    marginTop: 2,
  },
  criador: {
    color: Theme.colors.text.secondary,
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  gerenciarButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  gerenciarButtonText: {
    color: Theme.colors.text.primary,
    fontSize: Theme.fontSize.xs,
    fontWeight: "600",
  },
});
