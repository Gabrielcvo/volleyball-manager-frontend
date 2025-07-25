import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/authContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, operationLoading } = useAuth();
  const router = useRouter();

  const isFormValid = email.trim() !== "" && senha.trim() !== "";

  async function handleLogin() {
    if (!isFormValid) return;

    setIsLoggingIn(true);
    try {
      await login(email.trim(), senha);
    } catch {
      // erro já tratado pelo interceptor/toast
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleCadastro() {
    router.replace("/auth/register");
  }

  const isDisabled = operationLoading || isLoggingIn || !isFormValid;

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
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!operationLoading && !isLoggingIn}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#A0A4AB"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={senha}
        onChangeText={setSenha}
        editable={!operationLoading && !isLoggingIn}
        onSubmitEditing={handleLogin}
        returnKeyType="go"
      />
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isDisabled}
      >
        {isLoggingIn ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {operationLoading ? "Carregando..." : "Entrar"}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.cadastroContainer}>
        <Text style={styles.cadastroText}>Não tem uma conta?</Text>
        <TouchableOpacity
          onPress={handleCadastro}
          disabled={operationLoading || isLoggingIn}
        >
          <Text
            style={[
              styles.cadastroLink,
              (operationLoading || isLoggingIn) && styles.linkDisabled,
            ]}
          >
            Cadastre-se
          </Text>
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
  buttonDisabled: {
    backgroundColor: "#1a4bb8",
    opacity: 0.7,
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
  linkDisabled: {
    color: "#666",
  },
});
