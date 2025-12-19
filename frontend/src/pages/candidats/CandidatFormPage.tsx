import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Cycle, CYCLE_LABELS } from "@/types/models";
import candidatService, { CandidatFormData } from "@/services/candidatService";
import departementService from "@/services/departementService";
import ajoutCandidatHeroImg from "@/assets/illustrations/ajout-etudiant-hero.png";

const CYCLES: Cycle[] = ['INGENIEUR', 'SCIENCE_INGENIEUR', 'MASTER_PRO'];
const capitalize = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

export default function CandidatFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CandidatFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departements = [] } = useQuery({ queryKey: ['departements'], queryFn: departementService.getAll });
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
    mutationFn: (data: Partial<CandidatFormData>) => isEditing ? candidatService.update(id!, data) : candidatService.create(data as CandidatFormData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['candidats'] });
      if(isEditing) await queryClient.invalidateQueries({ queryKey: ['candidats', id] });
      toast.success(isEditing ? "Candidat modifié" : "Candidat créé");
      navigate("/candidats");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (typeof errorData === 'object' && errorData !== null) setErrors(errorData);
      else toast.error(errorData?.detail || "Une erreur est survenue.");
    },
  });

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "Prénom requis";
    if (!formData.last_name?.trim()) newErrors.last_name = "Nom requis";
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email valide requis";
    if (!formData.username?.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!isEditing && !formData.password) newErrors.password = "Mot de passe requis (8 caractères min)";
    if (formData.password && formData.password.length < 8) newErrors.password = "8 caractères minimum";
    if (!formData.matricule?.trim()) newErrors.matricule = "Matricule requis";
    if (!formData.departement_id) newErrors.departement_id = "Département requis";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      saveMutation.mutate(formData);
    }
  };
  
  const handleInputChange = (field: keyof CandidatFormData, value: string) => {
    let processedValue = value;
    if (field === 'first_name' || field === 'last_name') processedValue = capitalize(value);
    if (field === 'matricule') processedValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  if (isLoadingCandidat) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
                <Button variant="ghost" size="sm" onClick={() => navigate("/candidats")} className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
                <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Modifier le candidat" : "Nouveau candidat"}</h1>
                <p className="text-muted-foreground text-sm">Remplissez les informations pour {isEditing ? "mettre à jour le profil" : "créer un nouveau compte"}.</p>
            </div>
            <img src={ajoutCandidatHeroImg} alt="Ajout d'un candidat" className="w-32 h-auto hidden md:block"/>
        </div>

        <form onSubmit={validateAndSubmit} className="space-y-8">
            <Card><CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Informations Personnelles & Accès</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div><Label>Prénom</Label><Input value={formData.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} />{errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}</div>
                    <div><Label>Nom</Label><Input value={formData.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} />{errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}</div>
                    <div><Label>Email</Label><Input type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div>
                    <div><Label>Nom d'utilisateur</Label><Input value={formData.username || ''} onChange={e => handleInputChange('username', e.target.value)} />{errors.username && <p className="text-sm text-destructive">{errors.username}</p>}</div>
                    <div><Label>Téléphone</Label><Input value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} /></div>
                    <div><Label>Mot de passe</Label><Input type="password" onChange={e => handleInputChange('password', e.target.value)} placeholder={isEditing ? "Laisser vide pour ne pas changer" : ""}/>{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}</div>
                </div>
            </CardContent></Card>

            <Card><CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Profil Académique</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div><Label>Matricule</Label><Input value={formData.matricule || ''} onChange={e => handleInputChange('matricule', e.target.value)} />{errors.matricule && <p className="text-sm text-destructive">{errors.matricule}</p>}</div>
                    <div><Label>Cycle</Label><Select value={formData.cycle} onValueChange={cycle => setFormData({...formData, cycle: cycle as Cycle})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CYCLES.map(c => <SelectItem key={c} value={c}>{CYCLE_LABELS[c]}</SelectItem>)}</SelectContent></Select>{errors.cycle && <p className="text-sm text-destructive">{errors.cycle}</p>}</div>
                    <div className="md:col-span-2"><Label>Département</Label><Select value={formData.departement_id} onValueChange={departement_id => setFormData({...formData, departement_id})}><SelectTrigger><SelectValue placeholder="Sélectionner..."/></SelectTrigger><SelectContent>{departements.map(d => <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>)}</SelectContent></Select>{errors.departement_id && <p className="text-sm text-destructive">{errors.departement_id}</p>}</div>
                </div>
            </CardContent></Card>

            <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate("/candidats")}>Annuler</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Enregistrement...</> : <><Save className="mr-2 h-4 w-4"/>Enregistrer</>}</Button></div>
        </form>
    </div>
  );
}
