import { useApiToast } from "@/hooks/useApiToast";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
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
    <AuthProvider>
      <AlertProvider>
        <ToastConfig />
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/register"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
