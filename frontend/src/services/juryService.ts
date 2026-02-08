import api from '@/lib/api';
import { Jury, JuryFormData } from '@/types/models';

class JuryService {

  async getAll(params?: { session?: string }): Promise<Jury[]> {
    const response = await api.get('/jurys/', { params });
    return response.data.results || response.data;
  }

  async getById(id: string): Promise<Jury> {
    const response = await api.get(`/jurys/${id}/`);
    return response.data;
  }

  async create(data: JuryFormData): Promise<Jury> {
    const response = await api.post('/jurys/', data);
    return response.data;
  }

  async update(id: string, data: Partial<JuryFormData>): Promise<Jury> {
    const response = await api.patch(`/jurys/${id}/`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/jurys/${id}/`);
  }

  async valider(id: string): Promise<Jury> {
    const response = await api.post(`/jurys/${id}/valider/`);
    return response.data;
  }

  async activer(id: string): Promise<Jury> {
    const response = await api.post(`/jurys/${id}/activer/`);
    return response.data;
  }

  async getByEnseignantId(enseignantId: string): Promise<Jury[]> {
      const response = await api.get('/jurys/', {
        params: { enseignant: enseignantId }
      });
      return response.data.results || response.data;
  }
}

export default new JuryService();
