import { ScreenLayout } from "@/components/ScreenLayout";
import { ThemedText } from "@/components/ThemedText";
import { Theme } from "@/constants/Colors";
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
    <ScreenLayout
      title="Entrar"
      showHeader={false}
      showFooter={false}
      keyboardAvoiding
    >
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Entrar
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={Theme.colors.text.secondary}
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
          placeholderTextColor={Theme.colors.text.secondary}
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
            <ActivityIndicator color={Theme.colors.text.primary} />
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
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: "center",
  },
  title: {
    alignSelf: "center",
    marginBottom: Theme.spacing.xxxl,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text.primary,
    borderRadius: Theme.borderRadius.md,
    padding: 14,
    marginBottom: Theme.spacing.lg,
    fontSize: Theme.fontSize.lg,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.round,
    paddingVertical: Theme.spacing.lg,
    alignItems: "center",
    marginTop: Theme.spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.primaryDark,
    opacity: 0.7,
  },
  buttonText: {
    color: Theme.colors.text.primary,
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
  },
  cadastroContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Theme.spacing.xxl,
    gap: 6,
  },
  cadastroText: {
    color: Theme.colors.text.secondary,
    fontSize: Theme.fontSize.md,
  },
  cadastroLink: {
    color: Theme.colors.primary,
    fontWeight: "bold",
    fontSize: Theme.fontSize.md,
  },
  linkDisabled: {
    color: Theme.colors.text.disabled,
  },
});
