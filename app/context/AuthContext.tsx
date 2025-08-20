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
import AuthService, { RegisterRequest, User } from "../../services/api/auth";
import { deleteItem, getItem, setItem } from "../utils/SecureStore";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    nome: string,
    email: string,
    senha: string,
    avatar_url?: string
  ) => Promise<void>;
  initializing: boolean;
  operationLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initializing) {
      const inAuth = segments[0] === "auth";

      if (!isAuthenticated && !inAuth) {
        router.replace("/auth/login");
      } else if (isAuthenticated && inAuth) {
        router.replace("/(tabs)/profile");
      }
    }
  }, [isAuthenticated, initializing, segments, router]);

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
  }, []);

  const fetchProfile = useCallback(
    async (token: string) => {
      try {
        const response = await AuthService.fetchProfile();
        setUser(response.usuario);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        await clearAuthData();
      }
    },
    [clearAuthData]
  );

  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = await getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile(storedToken);
      }
    } catch (error) {
      console.error("Erro ao inicializar auth:", error);
      await clearAuthData();
    } finally {
      setInitializing(false);
    }
  }, [fetchProfile, clearAuthData]);

  const login = useCallback(async (email: string, senha: string) => {
    setOperationLoading(true);
    try {
      const response = await AuthService.login(email, senha);

      setToken(response.token);
      setUser(response.usuario);
      await setItem("token", response.token);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const register = useCallback(
    async (nome: string, email: string, senha: string, avatar_url?: string) => {
      setOperationLoading(true);
      try {
        const registerData: RegisterRequest = {
          nome,
          email,
          senha,
        };

        await AuthService.register(registerData);
      } catch (error) {
        console.error("Erro no registro:", error);
        throw error;
      } finally {
        setOperationLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setOperationLoading(true);
    try {
      await clearAuthData();
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setOperationLoading(false);
    }
  }, [clearAuthData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
