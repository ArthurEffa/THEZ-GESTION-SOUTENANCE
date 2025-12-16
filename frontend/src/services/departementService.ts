import api from '@/lib/api';

export interface Departement {
  id: string;  // UUID du backend
  code: string;
  nom: string;
  nb_candidats: number;
  nb_enseignants: number;
}

export interface DepartementFormData {
  code: string;
  nom: string;
}

class DepartementService {
  async getAll(): Promise<Departement[]> {
    const response = await api.get('/departements/');
    // L'API retourne un objet paginé {count, next, prev, results}
    return response.data.results || response.data;
  }

  async getById(id: string): Promise<Departement> {
    const response = await api.get(`/departements/${id}/`);
    return response.data;
  }

  async create(data: DepartementFormData): Promise<Departement> {
    const response = await api.post('/departements/', data);
    return response.data;
  }

  async update(id: string, data: DepartementFormData): Promise<Departement> {
    const response = await api.put(`/departements/${id}/`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/departements/${id}/`);
  }
}

export default new DepartementService();
