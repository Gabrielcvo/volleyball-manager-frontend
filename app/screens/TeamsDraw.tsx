import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const jogadores = ["João", "Maria", "Carlos", "Ana", "Pedro", "Lucas"];

export default function TeamsDrawScreen() {
  const [times, setTimes] = useState<{
    time1: string[];
    time2: string[];
  } | null>(null);

  function sortearTimes() {
    const embaralhados = [...jogadores].sort(() => Math.random() - 0.5);
    const meio = Math.ceil(embaralhados.length / 2);
    setTimes({
      time1: embaralhados.slice(0, meio),
      time2: embaralhados.slice(meio),
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Sorteio de Times
      </ThemedText>
      <TouchableOpacity style={styles.button} onPress={sortearTimes}>
        <Text style={styles.buttonText}>Sortear Times</Text>
      </TouchableOpacity>
      {times && (
        <View style={styles.teamsContainer}>
          <View style={styles.teamBox}>
            <Text style={styles.teamTitle}>Time 1</Text>
            {times.time1.map((j, i) => (
              <Text key={i} style={styles.player}>
                {j}
              </Text>
            ))}
          </View>
          <View style={styles.teamBox}>
            <Text style={styles.teamTitle}>Time 2</Text>
            {times.time2.map((j, i) => (
              <Text key={i} style={styles.player}>
                {j}
              </Text>
            ))}
          </View>
        </View>
      )}
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
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  teamBox: {
    flex: 1,
    backgroundColor: "#23262B",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  teamTitle: {
    color: "#A0A4AB",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  player: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 4,
  },
});
