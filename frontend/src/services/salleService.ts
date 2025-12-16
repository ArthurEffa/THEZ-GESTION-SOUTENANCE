import api from '@/lib/api';

export interface Salle {
  id: string;
  nom: string;
  batiment: string;
  capacite: number;
  est_disponible: boolean;
  created_at: string;
}

export interface SalleFormData {
  nom: string;
  batiment: string;
  capacite: number;
  est_disponible?: boolean;
}

class SalleService {
  async getAll(): Promise<Salle[]> {
    const response = await api.get('/salles/');
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  async getById(id: string): Promise<Salle> {
    const response = await api.get(`/salles/${id}/`);
    return response.data;
  }

  async create(data: SalleFormData): Promise<Salle> {
    const response = await api.post('/salles/', data);
    return response.data;
  }

  async update(id: string, data: SalleFormData): Promise<Salle> {
    const response = await api.put(`/salles/${id}/`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/salles/${id}/`);
  }
}

export default new SalleService();
