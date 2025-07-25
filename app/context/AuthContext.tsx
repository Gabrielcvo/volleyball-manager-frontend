import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, View } from "react-native";
import AuthService, { User } from "../../services/api/auth";
import { deleteItem, getItem, setItem } from "../utils/SecureStore";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  initializing: boolean;
  operationLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initializing) {
      const inAuth = segments[0] === "auth";

      if (!isAuthenticated && !inAuth) {
        // Usuário não autenticado e não está em páginas de auth
        router.replace("/auth/login");
      } else if (isAuthenticated && inAuth) {
        // Usuário autenticado mas está em páginas de auth
        router.replace("/(tabs)/games");
      }
    }
  }, [isAuthenticated, initializing, segments, router]);

  // Mostrar loading apenas durante inicialização
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#181B20",
        }}
      >
        <ActivityIndicator size="large" color="#2D6BFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);

  const clearAuthData = useCallback(async () => {
    setUser(null);
    setToken(null);
    await deleteItem("token");
  }, [setUser, setToken]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await AuthService.fetchProfile();
      setUser(data.usuario);
    } catch {
      await clearAuthData();
    }
  }, [clearAuthData]);

  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = await getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile();
      }
    } catch (error) {
      await clearAuthData();
      throw error;
    } finally {
      setInitializing(false);
    }
  }, [clearAuthData, fetchProfile, setInitializing, setToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(
    async (email: string, senha: string) => {
      setOperationLoading(true);
      try {
        const data = await AuthService.login(email, senha);
        setToken(data.token);
        setUser(data.usuario);
        await setItem("token", data.token);
        return true;
      } catch {
        return false;
      } finally {
        setOperationLoading(false);
      }
    },
    [setOperationLoading]
  );

  const register = useCallback(
    async (nome: string, email: string, senha: string) => {
      setOperationLoading(true);
      try {
        await AuthService.register(nome, email, senha);
        return true;
      } catch {
        return false;
      } finally {
        setOperationLoading(false);
      }
    },
    [setOperationLoading]
  );

  const logout = useCallback(async () => {
    await clearAuthData();
  }, [clearAuthData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        initializing,
        operationLoading,
      }}
    >
      <AuthGate>{children}</AuthGate>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
