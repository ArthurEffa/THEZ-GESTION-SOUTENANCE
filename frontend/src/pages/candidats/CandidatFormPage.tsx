import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Cycle, CYCLE_LABELS } from "@/types/models";
import candidatService, { CandidatFormData } from "@/services/candidatService";
import departementService from "@/services/departementService";

const CYCLES: Cycle[] = ['INGENIEUR', 'SCIENCE_INGENIEUR', 'MASTER_PRO'];

// Helper to capitalize first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export default function CandidatFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CandidatFormData>>({
    email: "", username: "", first_name: "", last_name: "",
    phone: "", matricule: "", cycle: "INGENIEUR", departement_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departements = [] } = useQuery({
    queryKey: ['departements'],
    queryFn: departementService.getAll,
  });

  const { data: candidat, isLoading: isLoadingCandidat } = useQuery({
    queryKey: ['candidats', id],
    queryFn: () => candidatService.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (candidat) {
      setFormData({
        email: candidat.user.email, username: candidat.user.username,
        first_name: candidat.user.first_name, last_name: candidat.user.last_name,
        phone: candidat.user.phone || "", matricule: candidat.matricule,
        cycle: candidat.cycle, departement_id: candidat.departement?.id || "",
      });
    }
  }, [candidat]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<CandidatFormData>) => {
      if (isEditing) {
        return candidatService.update(id!, data);
      } else {
        return candidatService.create(data as CandidatFormData);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['candidats'] });
      if (isEditing) await queryClient.invalidateQueries({ queryKey: ['candidats', id] });
      toast.success(isEditing ? "Candidat modifié" : "Candidat créé");
      navigate("/candidats");
    },
    onError: (error: any) => {
        const errorData = error.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
            setErrors(errorData);
            toast.error("Erreur de validation. Veuillez vérifier les champs.");
        } else {
            toast.error(errorData?.detail || "Une erreur est survenue.");
        }
    },
  });

  const handleInputChange = (field: keyof CandidatFormData, value: string) => {
    let processedValue = value;
    if (field === 'first_name' || field === 'last_name') {
      processedValue = capitalize(value);
    }
    if (field === 'matricule') {
      processedValue = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoadingCandidat) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/candidats")} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Modifier le candidat" : "Nouveau candidat"}</h1>
        <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2"><Label htmlFor="first_name">Prénom</Label><Input id="first_name" value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} />{errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}</div>
            <div className="space-y-2"><Label htmlFor="last_name">Nom</Label><Input id="last_name" value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} />{errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}</div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div>
            <div className="space-y-2"><Label htmlFor="username">Nom d'utilisateur</Label><Input id="username" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} />{errors.username && <p className="text-sm text-destructive">{errors.username}</p>}</div>
            <div className="space-y-2"><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="password">Mot de passe</Label><Input id="password" type="password" onChange={e => handleInputChange('password', e.target.value)} placeholder={isEditing ? "Laisser vide pour ne pas changer" : "8 caractères min."}/>{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}</div>
        </div>

        <div className="border-t pt-8 space-y-8">
            <h2 className="text-lg font-semibold">Profil Académique</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2"><Label htmlFor="matricule">Matricule</Label><Input id="matricule" value={formData.matricule} onChange={e => handleInputChange('matricule', e.target.value)} />{errors.matricule && <p className="text-sm text-destructive">{errors.matricule}</p>}</div>
                <div className="space-y-2"><Label htmlFor="cycle">Cycle</Label><Select value={formData.cycle} onValueChange={cycle => setFormData({...formData, cycle: cycle as Cycle})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CYCLES.map(c => <SelectItem key={c} value={c}>{CYCLE_LABELS[c]}</SelectItem>)}</SelectContent></Select>{errors.cycle && <p className="text-sm text-destructive">{errors.cycle}</p>}</div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="departement_id">Département</Label><Select value={formData.departement_id} onValueChange={departement_id => setFormData({...formData, departement_id})}><SelectTrigger><SelectValue placeholder="Sélectionner un département"/></SelectTrigger><SelectContent>{departements.map(d => <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>)}</SelectContent></Select>{errors.departement_id && <p className="text-sm text-destructive">{errors.departement_id}</p>}</div>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate("/candidats")}>Annuler</Button>
          <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Enregistrement...</> : <><Save className="mr-2 h-4 w-4"/>Enregistrer</>}</Button>
        </div>
      </form>
    </div>
  );
}
