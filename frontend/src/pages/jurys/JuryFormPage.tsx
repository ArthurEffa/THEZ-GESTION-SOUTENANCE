import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import juryService from "@/services/juryService";
import enseignantService from "@/services/enseignantService";
import sessionService from "@/services/sessionService";
import { StatutJury, RoleMembreJury, STATUT_JURY_LABELS, ROLE_MEMBRE_JURY_LABELS } from "@/types/models";

const STATUTS_JURY: StatutJury[] = ['PROPOSE', 'VALIDE', 'ACTIF'];
const ROLES_MEMBRE: RoleMembreJury[] = ['PRESIDENT', 'RAPPORTEUR', 'ENCADREUR', 'EXAMINATEUR'];

interface MembreJuryForm {
  enseignant_id: string;
  role: RoleMembreJury | "";
}

export default function JuryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nom: "",
    session_id: "",
    statut: "PROPOSE" as StatutJury,
    membres_data: [] as MembreJuryForm[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: enseignants = [] } = useQuery({ queryKey: ['enseignants'], queryFn: () => enseignantService.getAll() });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions', 'open'], queryFn: () => sessionService.getAll({ statut: 'OUVERT' }) });
  const { data: jury, isLoading: isLoadingJury } = useQuery({ queryKey: ['jurys', id], queryFn: () => juryService.getById(id!), enabled: isEditing });

  useEffect(() => {
    if (jury) {
      setFormData({
        nom: jury.nom,
        session_id: jury.session_id,
        statut: jury.statut,
        membres_data: jury.composition?.map(m => ({ enseignant_id: m.enseignant_id, role: m.role })) || [],
      });
    }
  }, [jury]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return isEditing ? juryService.update(id!, { nom: data.nom, session_id: data.session_id }) : juryService.create(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['jurys'] });
      if(isEditing) await queryClient.invalidateQueries({ queryKey: ['jurys', id] });
      toast.success(isEditing ? "Jury modifié" : "Jury créé");
      navigate("/jurys");
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Erreur de sauvegarde"),
  });

  const handleAddMembre = () => setFormData({ ...formData, membres_data: [...formData.membres_data, { enseignant_id: "", role: "" }] });
  const handleRemoveMembre = (index: number) => setFormData({ ...formData, membres_data: formData.membres_data.filter((_, i) => i !== index) });
  const handleMembreChange = (index: number, field: keyof MembreJuryForm, value: string) => {
    const newMembres = [...formData.membres_data];
    newMembres[index] = { ...newMembres[index], [field]: value };
    setFormData({ ...formData, membres_data: newMembres });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoadingJury) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/jurys")} className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" />Retour à la liste</Button>
        <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Modifier le jury" : "Nouveau jury"}</h1>
        <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 md:col-span-2"><Label htmlFor="nom">Nom du jury</Label><Input id="nom" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="session_id">Session</Label><Select value={formData.session_id} onValueChange={v => setFormData({ ...formData, session_id: v })}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.titre}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="statut">Statut</Label><Select value={formData.statut} onValueChange={v => setFormData({ ...formData, statut: v as StatutJury })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUTS_JURY.map(s => <SelectItem key={s} value={s}>{STATUT_JURY_LABELS[s]}</SelectItem>)}</SelectContent></Select></div>
        </div>

        {!isEditing && (
          <div className="border-t pt-8 space-y-4">
            <h2 className="text-lg font-semibold">Composition du jury</h2>
            {formData.membres_data.map((membre, index) => (
              <div key={index} className="flex gap-4 items-center p-3 border rounded-lg bg-background">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Enseignant</Label><Select value={membre.enseignant_id} onValueChange={v => handleMembreChange(index, "enseignant_id", v)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{enseignants.map(e => <SelectItem key={e.id} value={e.id}>{e.user.first_name} {e.user.last_name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Rôle</Label><Select value={membre.role} onValueChange={v => handleMembreChange(index, "role", v)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{ROLES_MEMBRE.map(r => <SelectItem key={r} value={r}>{ROLE_MEMBRE_JURY_LABELS[r]}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMembre(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddMembre} className="w-full"><Plus className="mr-2 h-4 w-4" />Ajouter un membre</Button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate("/jurys")}>Annuler</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}</Button>
        </div>
      </form>
    </div>
  );
}
