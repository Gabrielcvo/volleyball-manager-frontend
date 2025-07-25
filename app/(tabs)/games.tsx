import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Jogos</ThemedText>
        <TouchableOpacity
          style={styles.cadastrarButton}
          onPress={irParaCadastro}
        >
          <Text style={styles.cadastrarButtonText}>+ Cadastrar Jogo</Text>
        </TouchableOpacity>
      </View>
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
        style={{ marginTop: 16 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cadastrarButton: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cadastrarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  jogoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23262B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipo: {
    color: "#A0A4AB",
    fontSize: 13,
    fontWeight: "600",
  },
  local: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  data: {
    color: "#A0A4AB",
    fontSize: 13,
  },
  criador: {
    color: "#A0A4AB",
    fontSize: 13,
    marginTop: 2,
  },
  gerenciarButton: {
    backgroundColor: "#2D6BFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  gerenciarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
