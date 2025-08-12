import { useApiToast } from "@/hooks/useApiToast";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { queryClient } from "../services/config/queryClient";
import { AlertProvider } from "./context/alertContext";
import { AuthProvider } from "./context/authContext";

function ToastConfig() {
  useApiToast();
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertProvider>
          <ToastConfig />
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
