import api from '@/lib/api';
import { Jury, MembreJury } from '@/types/models';

export interface JuryFormData {
  nom: string;
  session_id: string;
  membres: {
    enseignant_id: string;
    role: 'PRESIDENT' | 'RAPPORTEUR' | 'ENCADREUR' | 'EXAMINATEUR';
  }[];
}

export interface JuryUpdateData {
  nom?: string;
  session_id?: string;
}

class JuryService {
  /**
   * Récupérer tous les jurys
   */
  async getAll(params?: { session_id?: string; statut?: string }): Promise<Jury[]> {
    const response = await api.get('/jurys/', { params });
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  /**
   * Récupérer un jury par ID
   */
  async getById(id: string): Promise<Jury> {
    const response = await api.get(`/jurys/${id}/`);
    return response.data;
  }

  /**
   * Créer un nouveau jury
   */
  async create(data: JuryFormData): Promise<Jury> {
    const response = await api.post('/jurys/', {
      nom: data.nom,
      session_id: data.session_id,
      membres: data.membres,
    });

    return response.data;
  }

  /**
   * Mettre à jour un jury existant
   */
  async update(id: string, data: JuryUpdateData): Promise<Jury> {
    const response = await api.patch(`/jurys/${id}/`, data);
    return response.data;
  }

  /**
   * Supprimer un jury
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/jurys/${id}/`);
  }

  /**
   * Valider un jury (change le statut à VALIDE)
   */
  async valider(id: string): Promise<Jury> {
    const response = await api.post(`/jurys/${id}/valider/`);
    return response.data;
  }

  /**
   * Activer un jury (change le statut à ACTIF)
   */
  async activer(id: string): Promise<Jury> {
    const response = await api.post(`/jurys/${id}/activer/`);
    return response.data;
  }

  /**
   * Ajouter un membre au jury
   */
  async addMembre(juryId: string, membreData: { enseignant_id: string; role: string }): Promise<MembreJury> {
    const response = await api.post('/membres-jury/', {
      jury_id: juryId,
      enseignant_id: membreData.enseignant_id,
      role: membreData.role,
    });
    return response.data;
  }

  /**
   * Supprimer un membre du jury
   */
  async removeMembre(membreId: string): Promise<void> {
    await api.delete(`/membres-jury/${membreId}/`);
  }

  /**
   * Récupérer les membres d'un jury
   */
  async getMembres(juryId: string): Promise<MembreJury[]> {
    const response = await api.get('/membres-jury/', {
      params: { jury_id: juryId }
    });
    return response.data.results || response.data;
  }
}

export default new JuryService();
