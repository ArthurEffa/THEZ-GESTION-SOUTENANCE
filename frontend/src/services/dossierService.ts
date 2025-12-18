import api from '@/lib/api';
import { DossierSoutenance } from '@/types/models';

export interface DossierFormData {
  candidat_id: string;
  session_id: string;
  titre_memoire: string;
  encadreur_id?: string;
}

export interface DossierUpdateData {
  titre_memoire?: string;
  encadreur_id?: string;
  statut?: string;
}

class DossierService {
  /**
   * Récupérer tous les dossiers
   */
  async getAll(params?: {
    statut?: string;
    session?: string;
    candidat__cycle?: string;
    demande_suppression?: boolean;
  }): Promise<DossierSoutenance[]> {
    const response = await api.get('/dossiers/', { params });
    return response.data.results || response.data;
  }

  /**
   * Récupérer un dossier par ID
   */
  async getById(id: string): Promise<DossierSoutenance> {
    const response = await api.get(`/dossiers/${id}/`);
    return response.data;
  }

  /**
   * Récupérer les dossiers d'un candidat
   */
  async getByCandidatId(candidatId: string): Promise<DossierSoutenance[]> {
    const response = await api.get('/dossiers/', {
      params: { candidat: candidatId }
    });
    return response.data.results || response.data;
  }

  /**
   * Créer un nouveau dossier (Admin pour un candidat, ou Candidat pour lui-même)
   */
  async create(data: DossierFormData): Promise<DossierSoutenance> {
    const response = await api.post('/dossiers/', data);
    return response.data;
  }

  /**
   * Mettre à jour un dossier existant
   */
  async update(id: string, data: DossierUpdateData): Promise<DossierSoutenance> {
    const response = await api.patch(`/dossiers/${id}/`, data);
    return response.data;
  }

  /**
   * Supprimer un dossier
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/dossiers/${id}/`);
  }

  /**
   * Valider un dossier (Admin seulement)
   */
  async valider(id: string): Promise<DossierSoutenance> {
    const response = await api.post(`/dossiers/${id}/valider/`);
    return response.data;
  }

  /**
   * Rejeter un dossier (Admin seulement)
   */
  async rejeter(id: string, commentaires: string): Promise<DossierSoutenance> {
    const response = await api.post(`/dossiers/${id}/rejeter/`, { commentaires });
    return response.data;
  }

  /**
   * Récupérer les dossiers du candidat connecté
   */
  async getMesDossiers(): Promise<DossierSoutenance[]> {
    const response = await api.get('/dossiers/mes_dossiers/');
    return response.data;
  }

  /**
   * Demander la suppression d'un dossier (Candidat)
   */
  async demanderSuppression(id: string, commentaire: string): Promise<DossierSoutenance> {
    const response = await api.post(`/dossiers/${id}/demander_suppression/`, { commentaire });
    return response.data;
  }
}

export default new DossierService();
