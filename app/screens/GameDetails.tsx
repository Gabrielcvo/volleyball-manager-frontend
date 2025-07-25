import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const confirmados = [
  { id: "1", nome: "João" },
  { id: "2", nome: "Maria" },
  { id: "3", nome: "Carlos" },
];
const espera = [{ id: "4", nome: "Ana" }];

export default function GameDetailsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Detalhes da Pelada
      </ThemedText>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>20/07/2024</Text>
        <Text style={styles.label}>Horário:</Text>
        <Text style={styles.value}>15:00 - 17:00</Text>
        <Text style={styles.label}>Local:</Text>
        <Text style={styles.value}>Praia de Copacabana</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Confirmar Presença</Text>
      </TouchableOpacity>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Confirmados
      </ThemedText>
      <FlatList
        data={confirmados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.listItem}>{item.nome}</Text>
        )}
        style={{ marginBottom: 12 }}
      />
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Lista de Espera
      </ThemedText>
      <FlatList
        data={espera}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.listItem}>{item.nome}</Text>
        )}
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
  title: {
    alignSelf: "center",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "#23262B",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    color: "#A0A4AB",
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  listItem: {
    color: "#fff",
    backgroundColor: "#23262B",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    fontSize: 15,
  },
});
