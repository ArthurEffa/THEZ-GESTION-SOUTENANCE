import api from '@/lib/api';
import { CustomUser } from '@/types/models';

export interface UserFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;
  role: 'ADMIN' | 'CANDIDAT' | 'ENSEIGNANT';
  is_active?: boolean;
}

class UserService {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAll(): Promise<CustomUser[]> {
    const response = await api.get('/users/');
    return response.data.results || response.data;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: string): Promise<CustomUser> {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  }

  /**
   * Récupérer l'utilisateur connecté
   */
  async me(): Promise<CustomUser> {
    const response = await api.get('/users/me/');
    return response.data;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async create(data: UserFormData): Promise<CustomUser> {
    const response = await api.post('/users/', data);
    return response.data;
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(id: string, data: Partial<UserFormData>): Promise<CustomUser> {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  }

  /**
   * Supprimer un utilisateur
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}/`);
  }

  /**
   * Définir un nouveau mot de passe pour un utilisateur (Admin)
   */
  async setPassword(id: string, password: string): Promise<void> {
    await api.post(`/users/${id}/set_password/`, { password });
  }
}

export default new UserService();
