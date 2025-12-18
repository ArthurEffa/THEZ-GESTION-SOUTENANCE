import api from '@/lib/api';
import { Soutenance } from '@/types/models';

export interface SoutenanceFormData {
  dossier_id: string;
  jury_id?: string;
  salle_id?: string;
  date_heure?: string;
  duree_minutes?: number;
  ordre_passage?: number;
}

export interface SoutenanceUpdateData {
  jury_id?: string;
  salle_id?: string;
  date_heure?: string;
  duree_minutes?: number;
  ordre_passage?: number;
  statut?: string;
}

export interface PlanifierData {
  date_heure: string;
  salle_id?: string;
  ordre_passage?: number;
  duree_minutes?: number;
}

class SoutenanceService {
  /**
   * Récupérer toutes les soutenances
   */
  async getAll(params?: {
    statut?: string;
    salle?: string;
  }): Promise<Soutenance[]> {
    const response = await api.get('/soutenances/', { params });
    return response.data.results || response.data;
  }

  /**
   * Récupérer une soutenance par ID
   */
  async getById(id: string): Promise<Soutenance> {
    const response = await api.get(`/soutenances/${id}/`);
    return response.data;
  }

  /**
   * Créer une nouvelle soutenance
   */
  async create(data: SoutenanceFormData): Promise<Soutenance> {
    const response = await api.post('/soutenances/', data);
    return response.data;
  }

  /**
   * Mettre à jour une soutenance
   */
  async update(id: string, data: SoutenanceUpdateData): Promise<Soutenance> {
    const response = await api.patch(`/soutenances/${id}/`, data);
    return response.data;
  }

  /**
   * Supprimer une soutenance
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/soutenances/${id}/`);
  }

  /**
   * Planifier une soutenance (date, salle, ordre)
   */
  async planifier(id: string, data: PlanifierData): Promise<Soutenance> {
    const response = await api.post(`/soutenances/${id}/planifier/`, data);
    return response.data;
  }

  /**
   * Démarrer une soutenance
   */
  async demarrer(id: string): Promise<Soutenance> {
    const response = await api.post(`/soutenances/${id}/demarrer/`);
    return response.data;
  }

  /**
   * Terminer une soutenance
   */
  async terminer(id: string): Promise<Soutenance> {
    const response = await api.post(`/soutenances/${id}/terminer/`);
    return response.data;
  }

  /**
   * Récupérer les soutenances selon le rôle
   */
  async getMesSoutenances(): Promise<Soutenance[]> {
    const response = await api.get('/soutenances/mes_soutenances/');
    return response.data;
  }
}

export default new SoutenanceService();
