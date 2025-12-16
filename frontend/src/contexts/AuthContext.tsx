import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import { CustomUser } from '@/types/models';

export type UserRole = 'ADMIN' | 'CANDIDAT' | 'ENSEIGNANT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction pour convertir CustomUser (backend) en User (frontend)
function convertToUser(customUser: CustomUser): User {
  return {
    id: customUser.id,
    email: customUser.email,
    firstName: customUser.first_name,
    lastName: customUser.last_name,
    role: customUser.role,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a une session existante
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(convertToUser(currentUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      const userData = convertToUser(response.user);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
