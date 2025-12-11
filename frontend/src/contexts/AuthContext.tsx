import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'etudiant' | 'jury' | 'encadreur';

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing without backend
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@ecole.fr': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@ecole.fr',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'admin',
    },
  },
  'etudiant@ecole.fr': {
    password: 'etudiant123',
    user: {
      id: '2',
      email: 'etudiant@ecole.fr',
      firstName: 'Pierre',
      lastName: 'Martin',
      role: 'etudiant',
    },
  },
  'jury@ecole.fr': {
    password: 'jury123',
    user: {
      id: '3',
      email: 'jury@ecole.fr',
      firstName: 'Jean',
      lastName: 'Professeur',
      role: 'jury',
    },
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('soutenance_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('soutenance_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('soutenance_user', JSON.stringify(demoUser.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soutenance_user');
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
