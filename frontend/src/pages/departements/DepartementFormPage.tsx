
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import departementService, { DepartementFormData } from "@/services/departementService";

export default function DepartementFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<DepartementFormData>({
    code: "",
    nom: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departement, isLoading: isLoadingDept } = useQuery({
    queryKey: ['departement', id],
    queryFn: () => departementService.getById(id!),
    enabled: isEditing && !!id,
  });

  useEffect(() => {
    if (departement) {
      setFormData({ code: departement.code, nom: departement.nom });
    }
  }, [departement]);

  const saveMutation = useMutation({
    mutationFn: (data: DepartementFormData) => {
      return isEditing && id ? departementService.update(id, data) : departementService.create(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departements'] });
      toast.success(isEditing ? "Département modifié" : "Département créé");
      navigate("/departements");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.code.trim()) newErrors.code = "Le code est requis";
    else if (formData.code.length > 10) newErrors.code = "10 caractères max";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(formData);
  };

  if (isLoadingDept) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/departements")} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier le département" : "Nouveau département"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Remplissez les informations ci-dessous pour {isEditing ? "modifier" : "créer"} un département.
          </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du département</Label>
              <Input
                id="nom"
                placeholder="Ex: Génie Informatique & Télécommunications"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={errors.nom ? "border-destructive" : ""}
              />
              {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="Ex: GIT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={errors.code ? "border-destructive" : ""}
                maxLength={10}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate("/departements")}>
            Annuler
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Enregistrer</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
