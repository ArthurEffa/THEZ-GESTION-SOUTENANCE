import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GradeEnseignant, GRADE_ENSEIGNANT_LABELS } from "@/types/models";
import enseignantService, { EnseignantFormData } from "@/services/enseignantService";
import departementService from "@/services/departementService";
import enseignantHeroImg from "@/assets/illustrations/enseignant-hero.png";

const GRADES: GradeEnseignant[] = ['PROFESSEUR', 'MAITRE_CONF', 'CHARGE_COURS', 'ASSISTANT'];
const capitalize = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

export default function EnseignantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<EnseignantFormData>>({
    email: "", username: "", first_name: "", last_name: "",
    phone: "", grade: "PROFESSEUR", departement_ids: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departements = [] } = useQuery({ queryKey: ['departements'], queryFn: departementService.getAll });
  const { data: enseignant, isLoading: isLoadingEnseignant } = useQuery({
    queryKey: ['enseignants', id],
    queryFn: () => enseignantService.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (enseignant) {
      setFormData({
        email: enseignant.user.email, username: enseignant.user.username,
        first_name: enseignant.user.first_name, last_name: enseignant.user.last_name,
        phone: enseignant.user.phone || "", grade: enseignant.grade,
        departement_ids: enseignant.departements.map(d => d.id),
      });
    }
  }, [enseignant]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<EnseignantFormData>) =>
      isEditing ? enseignantService.update(id!, data) : enseignantService.create(data as EnseignantFormData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enseignants'] });
      if (isEditing) await queryClient.invalidateQueries({ queryKey: ['enseignants', id] });
      toast.success(isEditing ? "Enseignant modifié" : "Enseignant créé");
      navigate("/enseignants");
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "Prénom requis";
    if (!formData.last_name?.trim()) newErrors.last_name = "Nom requis";
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email!)) newErrors.email = "Email valide requis";
    if (!formData.username?.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!isEditing && !formData.password) newErrors.password = "Mot de passe requis (8 caractères min)";
    if (formData.password && formData.password.length < 8) newErrors.password = "8 caractères minimum";
    if (!formData.departement_ids || formData.departement_ids.length === 0) newErrors.departement_ids = "Au moins un département requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) saveMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof EnseignantFormData, value: string) => {
    let processedValue = value;
    if (field === 'first_name' || field === 'last_name') processedValue = capitalize(value);
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  if (isLoadingEnseignant) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={() => navigate("/enseignants")} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />Retour
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier l'enseignant" : "Nouvel enseignant"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Remplissez les informations pour {isEditing ? "mettre à jour le profil" : "créer un nouveau compte"}.
          </p>
        </div>
        <img src={enseignantHeroImg} alt="Enseignant" className="w-32 h-auto hidden md:block" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informations Personnelles & Accès</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div><Label>Prénom</Label><Input value={formData.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} className={errors.first_name ? "border-destructive" : ""} />{errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}</div>
              <div><Label>Nom</Label><Input value={formData.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} className={errors.last_name ? "border-destructive" : ""} />{errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}</div>
              <div><Label>Email</Label><Input type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} className={errors.email ? "border-destructive" : ""} />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div>
              <div><Label>Nom d'utilisateur</Label><Input value={formData.username || ''} onChange={e => handleInputChange('username', e.target.value)} className={errors.username ? "border-destructive" : ""} />{errors.username && <p className="text-sm text-destructive">{errors.username}</p>}</div>
              <div><Label>Téléphone</Label><Input value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} /></div>
              <div><Label>Mot de passe</Label><Input type="password" onChange={e => handleInputChange('password', e.target.value)} placeholder={isEditing ? "Laisser vide pour ne pas changer" : "8 caractères minimum"} className={errors.password ? "border-destructive" : ""} />{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Profil Académique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label>Grade</Label>
                <Select value={formData.grade} onValueChange={grade => setFormData({ ...formData, grade: grade as GradeEnseignant })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{GRADE_ENSEIGNANT_LABELS[g]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              <Label>Départements de rattachement</Label>
              <div className="mt-2 p-4 border rounded-md grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                {departements.map(dept => (
                  <div key={dept.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`dept-${dept.id}`}
                      checked={formData.departement_ids?.includes(dept.id)}
                      onCheckedChange={() => {
                        const newIds = formData.departement_ids?.includes(dept.id)
                          ? formData.departement_ids.filter(did => did !== dept.id)
                          : [...(formData.departement_ids || []), dept.id];
                        setFormData({ ...formData, departement_ids: newIds });
                      }}
                    />
                    <Label htmlFor={`dept-${dept.id}`} className="font-normal text-sm cursor-pointer">{dept.nom}</Label>
                  </div>
                ))}
              </div>
              {errors.departement_ids && <p className="text-sm text-destructive mt-1">{errors.departement_ids}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate("/enseignants")}>Annuler</Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
