import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    const ok = await login(email, senha);
    if (ok) {
      router.replace("/(tabs)/games");
    }
    // Erros já tratados pelo interceptor/toast no AuthService
  }

  function handleCadastro() {
    router.replace("/auth/register");
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Entrar
      </ThemedText>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#A0A4AB"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#A0A4AB"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>
      <View style={styles.cadastroContainer}>
        <Text style={styles.cadastroText}>Não tem uma conta?</Text>
        <TouchableOpacity onPress={handleCadastro}>
          <Text style={styles.cadastroLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    alignSelf: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#23262B",
    color: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cadastroContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 6,
  },
  cadastroText: {
    color: "#A0A4AB",
    fontSize: 15,
  },
  cadastroLink: {
    color: "#2D6BFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
