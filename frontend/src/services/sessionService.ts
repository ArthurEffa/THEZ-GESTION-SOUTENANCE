import api from '@/lib/api';
import { SessionSoutenance } from '@/types/models';

export interface SessionFormData {
  titre: string;
  annee_academique: string;
  date_ouverture: string;
  date_cloture: string;
  niveau_concerne: string;
  statut?: 'OUVERT' | 'FERME' | 'EN_COURS' | 'TERMINE';
  description?: string;
}

export interface SessionUpdateData {
  titre?: string;
  annee_academique?: string;
  date_ouverture?: string;
  date_cloture?: string;
  niveau_concerne?: string;
  statut?: 'OUVERT' | 'FERME' | 'EN_COURS' | 'TERMINE';
  description?: string;
}

class SessionService {
  /**
   * Récupérer toutes les sessions
   */
  async getAll(params?: {
    statut?: string;
    niveau_concerne?: string;
    annee_academique?: string;
  }): Promise<SessionSoutenance[]> {
    const response = await api.get('/sessions/', { params });
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  /**
   * Récupérer une session par ID
   */
  async getById(id: string): Promise<SessionSoutenance> {
    const response = await api.get(`/sessions/${id}/`);
    return response.data;
  }

  /**
   * Récupérer la session active actuelle
   */
  async getActive(): Promise<SessionSoutenance> {
    const response = await api.get('/sessions/active/');
    return response.data;
  }

  /**
   * Créer une nouvelle session
   */
  async create(data: SessionFormData): Promise<SessionSoutenance> {
    const response = await api.post('/sessions/', data);
    return response.data;
  }

  /**
   * Mettre à jour une session existante
   */
  async update(id: string, data: SessionUpdateData): Promise<SessionSoutenance> {
    const response = await api.patch(`/sessions/${id}/`, data);
    return response.data;
  }

  /**
   * Supprimer une session
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/sessions/${id}/`);
  }
}

export default new SessionService();
