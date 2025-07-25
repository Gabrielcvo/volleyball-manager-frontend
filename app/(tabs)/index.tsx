import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  function handleComecar() {
    // Navegar para a tela principal (tabs)
    router.push("/(tabs)/games");
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        🏐 Volleyball Manager
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Gerencie suas peladas de vôlei
      </ThemedText>
      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="subtitle" style={styles.featuresTitle}>
          Funcionalidades:
        </ThemedText>
        <Text style={styles.feature}>• Crie e organize peladas</Text>
        <Text style={styles.feature}>• Confirme presença</Text>
        <Text style={styles.feature}>• Sorteie times automaticamente</Text>
        <Text style={styles.feature}>• Acompanhe estatísticas</Text>
        <Text style={styles.feature}>• Chat com os participantes</Text>
      </ThemedView>
      <TouchableOpacity style={styles.button} onPress={handleComecar}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  featuresTitle: {
    marginBottom: 16,
  },
  feature: {
    color: "#A0A4AB",
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
