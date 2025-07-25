import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthService, { User } from "../../services/api/auth";
import { deleteItem, getItem, setItem } from "../utils/SecureStore";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile();
      }
      setLoading(false);
    })();
  }, []);

  async function fetchProfile() {
    try {
      const data = await AuthService.fetchProfile();
      setUser(data.usuario);
    } catch {
      setUser(null);
      setToken(null);
      await deleteItem("token");
    }
  }

  async function login(email: string, senha: string) {
    setLoading(true);
    try {
      const data = await AuthService.login(email, senha);
      setToken(data.token);
      setUser(data.usuario);
      await setItem("token", data.token);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }

  async function register(nome: string, email: string, senha: string) {
    setLoading(true);
    try {
      await AuthService.register(nome, email, senha);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    deleteItem("token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
