import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image, StyleSheet, Text, View } from "react-native";

const history = [
  {
    id: "1",
    result: "Vitória contra a equipe 'Right Serve'",
    date: "20 de julho de 2024",
  },
  {
    id: "2",
    result: "Derrota para a equipe 'High Net'",
    date: "15 de julho de 2024",
  },
  {
    id: "3",
    result: "Vitória contra a equipe 'Spike'",
    date: "10 de julho de 2024",
  },
];

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.avatar}
        />
        <ThemedText type="title" style={styles.name}>
          Isabela Costa
        </ThemedText>
        <Text style={styles.level}>Nível: Intermediário</Text>
        <Text style={styles.organizedGames}>Jogos organizados: 5</Text>
      </View>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Histórico de Jogos
      </ThemedText>
      <View style={styles.historyContainer}>
        {history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyResult}>{item.result}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
        ))}
      </View>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Estatísticas
      </ThemedText>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Jogos Jogados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>10</Text>
          <Text style={styles.statLabel}>Vitórias</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBoxFull}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Derrotas</Text>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    marginBottom: 2,
  },
  level: {
    color: "#A0A4AB",
    fontSize: 14,
    marginBottom: 2,
  },
  organizedGames: {
    color: "#A0A4AB",
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: "#23262B",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyResult: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  historyDate: {
    color: "#A0A4AB",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#23262B",
    borderRadius: 8,
    alignItems: "center",
    padding: 16,
  },
  statBoxFull: {
    flex: 1,
    backgroundColor: "#23262B",
    borderRadius: 8,
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  statLabel: {
    color: "#A0A4AB",
    fontSize: 13,
  },
});
