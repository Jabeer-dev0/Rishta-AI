import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, saveToken, getToken, removeToken } from '../services/api';
import { socketService } from '../services/socket';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthUser {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  religion: string;
  city: string;
  country: string;
  education: string;
  profession: string;
  interests: string[];
  bio: string;
  familyBackground: string;
  photos: string[];
  profilePhoto: string;
  verified: boolean;
  verificationStatus: string;
  profileCompletion: number;
  profileViews: number;
  aiScore: number;
  role: string;
  partnerPreferences: any;
  personalityScores: any;
  socialMediaConnected: any;
  socialInsights: any;
  notificationPrefs: any;
  createdAt: string;
  lastActiveAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // On app start: restore session using cookies
  useEffect(() => {
    (async () => {
      try {
        const json = await authAPI.getMe();
        if (json?.data?.user) {
          setUser(json.data.user);
          socketService.connect(); // Connect socket on session restore
        }
      } catch (err) {
        // Silently fail if no cookie is present
        console.log('[Auth] No active session found.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const json = await authAPI.login(email, password);
      const userData: AuthUser = json?.data?.user;

      if (!userData) {
        throw new Error(json?.message || 'Login failed.');
      }

      setUser(userData);
      socketService.connect();
    } catch (err: any) {
      // Extract specific error message from backend response if available
      const message = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  // ── Signup ──────────────────────────────────────────────────────────────────
  const signup = async (userData: Record<string, any>) => {
    const json = await authAPI.register(userData);
    const newUser: AuthUser = json?.data?.user;

    if (!newUser) {
      throw new Error(json?.message || 'Registration failed.');
    }

    setUser(newUser);
    socketService.connect(); // Connect socket on signup
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await authAPI.logout();
    socketService.disconnect(); // Disconnect socket on logout
    setUser(null);
  };

  // ── Update user in state ────────────────────────────────────────────────────
  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  // ── Re-fetch user from backend ──────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const json = await authAPI.getMe();
      if (json?.data?.user) setUser(json.data.user);
    } catch { /* silently ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
