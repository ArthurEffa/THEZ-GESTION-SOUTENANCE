import api from '@/lib/api';
import { Document, TypePiece } from '@/types/models';

export interface DocumentFormData {
  dossier_id: string;
  type_piece: TypePiece;
  nom: string;
  fichier: File;
}

class DocumentService {
  async create(data: DocumentFormData): Promise<Document> {
    const formData = new FormData();
    formData.append('dossier', data.dossier_id);
    formData.append('type_piece', data.type_piece);
    formData.append('nom', data.nom);
    formData.append('fichier', data.fichier);

    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}/`);
  }
}

export default new DocumentService();
