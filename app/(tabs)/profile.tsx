import { ScreenLayout } from "@/components/ScreenLayout";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScreenLayout title="Perfil" scrollable>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.nome || "Usuário"}</Text>
          <Text style={styles.email}>{user?.email || "email@exemplo.com"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Jogos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Vitórias</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>67%</Text>
              <Text style={styles.statLabel}>Taxa de Vitória</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Histórico de Jogos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#23262B",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#A0A4AB",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    backgroundColor: "#23262B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6BFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#A0A4AB",
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#23262B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
