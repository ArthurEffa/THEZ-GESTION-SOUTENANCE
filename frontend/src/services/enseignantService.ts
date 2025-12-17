import api from '@/lib/api';
import { EnseignantProfile } from '@/types/models';

export interface EnseignantFormData {
  // Données utilisateur (pour création uniquement)
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;

  // Données profil enseignant
  grade: 'PROFESSEUR' | 'MAITRE_CONF' | 'CHARGE_COURS' | 'ASSISTANT';
  departement_ids?: string[];
}

class EnseignantService {
  /**
   * Récupérer tous les enseignants
   */
  async getAll(): Promise<EnseignantProfile[]> {
    const response = await api.get('/enseignants/');
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  /**
   * Récupérer un enseignant par ID
   */
  async getById(id: string): Promise<EnseignantProfile> {
    const response = await api.get(`/enseignants/${id}/`);
    return response.data;
  }

  /**
   * Créer un nouvel enseignant
   */
  async create(data: EnseignantFormData): Promise<EnseignantProfile> {
    const response = await api.post('/enseignants/', {
      email: data.email,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
      phone: data.phone,
      grade: data.grade,
      departement_ids: data.departement_ids || [],
    });

    return await this.getById(response.data.id);
  }

  /**
   * Mettre à jour un enseignant existant
   */
  async update(id: string, data: Partial<EnseignantFormData>): Promise<EnseignantProfile> {
    // 1. Mettre à jour les données utilisateur si fournies
    const enseignant = await this.getById(id);

    if (data.email || data.first_name || data.last_name || data.phone || data.password) {
      const userUpdateData: any = {};
      if (data.email) userUpdateData.email = data.email;
      if (data.username) userUpdateData.username = data.username;
      if (data.first_name) userUpdateData.first_name = data.first_name;
      if (data.last_name) userUpdateData.last_name = data.last_name;
      if (data.phone) userUpdateData.phone = data.phone;
      if (data.password) userUpdateData.password = data.password;

      await api.patch(`/users/${enseignant.user.id}/`, userUpdateData);
    }

    // 2. Mettre à jour le profil enseignant
    const profileUpdateData: any = {};
    if (data.grade) profileUpdateData.grade = data.grade;
    if (data.departement_ids !== undefined) {
      profileUpdateData.departement_ids = data.departement_ids;
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await api.patch(`/enseignants/${id}/`, profileUpdateData);
    }

    // Récupérer le profil complet mis à jour
    return await this.getById(id);
  }

  /**
   * Supprimer un enseignant
   */
  async delete(id: string): Promise<void> {
    // Récupérer d'abord l'enseignant pour avoir l'ID utilisateur
    const enseignant = await this.getById(id);

    // Supprimer le profil enseignant
    await api.delete(`/enseignants/${id}/`);

    // Supprimer l'utilisateur associé
    await api.delete(`/users/${enseignant.user.id}/`);
  }
}

export default new EnseignantService();
