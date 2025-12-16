import api from '@/lib/api';
import { CustomUser } from '@/types/models';

interface LoginResponse {
  access: string;
  refresh: string;
  user: CustomUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // 1. Obtenir les tokens JWT
    const tokenResponse = await api.post<{ access: string; refresh: string }>('/auth/login/', credentials);

    // Stocker les tokens temporairement
    localStorage.setItem('access_token', tokenResponse.data.access);
    localStorage.setItem('refresh_token', tokenResponse.data.refresh);

    // 2. Récupérer les données utilisateur avec le token
    const userResponse = await api.get<CustomUser>('/users/me/');

    // Stocker l'utilisateur
    localStorage.setItem('soutenance_user', JSON.stringify(userResponse.data));

    return {
      access: tokenResponse.data.access,
      refresh: tokenResponse.data.refresh,
      user: userResponse.data,
    };
  },

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage même en cas d'erreur
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('soutenance_user');
    }
  },

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });

    localStorage.setItem('access_token', response.data.access);
    return response.data.access;
  },

  /**
   * Récupérer l'utilisateur courant depuis le localStorage
   */
  getCurrentUser(): CustomUser | null {
    const userStr = localStorage.getItem('soutenance_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
