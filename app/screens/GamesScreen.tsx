import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Game {
  id: string;
  type: string;
  location: string;
  date: string;
  image?: any;
}

export default function GamesScreen() {
  const [games] = useState<Game[]>([]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.avatar}
        />
        <ThemedText type="title">Jogos</ThemedText>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Jogos Próximos
      </ThemedText>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={({ item }) => (
          <View style={styles.gameItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.location}>{item.location}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            {item.image && (
              <Image source={item.image} style={styles.gameImage} />
            )}
          </View>
        )}
        style={{ marginBottom: 24 }}
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Criar novo jogo</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23262B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  type: {
    color: "#A0A4AB",
    fontSize: 13,
    fontWeight: "600",
  },
  location: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    color: "#A0A4AB",
    fontSize: 13,
  },
  gameImage: {
    width: 80,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
