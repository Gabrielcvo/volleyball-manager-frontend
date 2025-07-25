import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/auth/login");
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Configurações
      </ThemedText>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Conta</Text>
        <TouchableOpacity style={styles.row}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileLabel}>Perfil</Text>
            <Text style={styles.profileEdit}>Editar informações pessoais</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notificações</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Notificações</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferências</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Raio de distância</Text>
          <Text style={styles.value}>10 km</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sobre</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Termos de uso</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Política de privacidade</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#A0A4AB",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23262B",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  rowText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
  },
  arrow: {
    color: "#A0A4AB",
    fontSize: 18,
    marginLeft: 8,
  },
  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  profileLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  profileEdit: {
    color: "#A0A4AB",
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: "#23262B",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
