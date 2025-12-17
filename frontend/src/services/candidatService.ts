import api from '@/lib/api';
import { CandidatProfile } from '@/types/models';

export interface CandidatFormData {
  // Données utilisateur (pour création uniquement)
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;

  // Données profil candidat
  matricule: string;
  cycle: 'INGENIEUR' | 'SCIENCE_INGENIEUR' | 'MASTER_PRO';
  departement_id?: string;
  photo?: File | string;
}

export interface CandidatCreatePayload {
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    phone?: string;
    role: 'CANDIDAT';
  };
  candidat_profile: {
    matricule: string;
    cycle: string;
    departement_id?: string;
  };
}

class CandidatService {
  /**
   * Récupérer tous les candidats
   */
  async getAll(): Promise<CandidatProfile[]> {
    const response = await api.get('/candidats/');
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  /**
   * Récupérer un candidat par ID
   */
  async getById(id: string): Promise<CandidatProfile> {
    const response = await api.get(`/candidats/${id}/`);
    return response.data;
  }

  /**
   * Créer un nouveau candidat
   * NOTE: Le backend crée automatiquement l'utilisateur ET le profil en une seule opération
   */
  async create(data: CandidatFormData): Promise<CandidatProfile> {
    // Créer le candidat (user + profil) en un seul appel
    const response = await api.post('/candidats/', {
      email: data.email,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
      phone: data.phone,
      matricule: data.matricule,
      cycle: data.cycle,
      departement_id: data.departement_id || null,
    });

    // Upload photo si fournie
    if (data.photo && data.photo instanceof File) {
      const formData = new FormData();
      formData.append('photo', data.photo);
      await api.patch(`/candidats/${response.data.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Récupérer le profil complet avec les relations
    return await this.getById(response.data.id);
  }

  /**
   * Mettre à jour un candidat existant
   */
  async update(id: string, data: Partial<CandidatFormData>): Promise<CandidatProfile> {
    // 1. Mettre à jour les données utilisateur si fournies
    const candidat = await this.getById(id);

    if (data.email || data.first_name || data.last_name || data.phone || data.password) {
      const userUpdateData: any = {};
      if (data.email) userUpdateData.email = data.email;
      if (data.username) userUpdateData.username = data.username;
      if (data.first_name) userUpdateData.first_name = data.first_name;
      if (data.last_name) userUpdateData.last_name = data.last_name;
      if (data.phone) userUpdateData.phone = data.phone;
      if (data.password) userUpdateData.password = data.password;

      await api.patch(`/users/${candidat.user.id}/`, userUpdateData);
    }

    // 2. Mettre à jour le profil candidat
    const profileUpdateData: any = {};
    if (data.matricule) profileUpdateData.matricule = data.matricule;
    if (data.cycle) profileUpdateData.cycle = data.cycle;
    if (data.departement_id !== undefined) {
      profileUpdateData.departement_id = data.departement_id || null;
    }

    // 3. Upload photo si fournie
    if (data.photo && data.photo instanceof File) {
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('matricule', data.matricule || candidat.matricule);
      formData.append('cycle', data.cycle || candidat.cycle);
      if (data.departement_id) {
        formData.append('departement_id', data.departement_id);
      }

      await api.patch(`/candidats/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else if (Object.keys(profileUpdateData).length > 0) {
      await api.patch(`/candidats/${id}/`, profileUpdateData);
    }

    // Récupérer le profil complet mis à jour
    return await this.getById(id);
  }

  /**
   * Supprimer un candidat
   */
  async delete(id: string): Promise<void> {
    // Récupérer d'abord le candidat pour avoir l'ID utilisateur
    const candidat = await this.getById(id);

    // Supprimer le profil candidat
    await api.delete(`/candidats/${id}/`);

    // Supprimer l'utilisateur associé
    await api.delete(`/users/${candidat.user.id}/`);
  }
}

export default new CandidatService();
