import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Charger les données du département en mode édition
  const { data: departement, isLoading: isLoadingDept } = useQuery({
    queryKey: ['departement', id],
    queryFn: () => departementService.getById(id!),
    enabled: isEditing && !!id,
  });

  // Remplir le formulaire avec les données chargées
  useEffect(() => {
    if (departement) {
      setFormData({
        code: departement.code,
        nom: departement.nom,
      });
    }
  }, [departement]);

  // Mutation pour créer/modifier
  const saveMutation = useMutation({
    mutationFn: (data: DepartementFormData) => {
      if (isEditing && id) {
        return departementService.update(id, data);
      }
      return departementService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departements'] });
      toast.success(isEditing ? "Département modifié avec succès" : "Département créé avec succès");
      navigate("/departements");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(errorMessage);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis";
    } else if (formData.code.length > 10) {
      newErrors.code = "Le code ne peut pas dépasser 10 caractères";
    }
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(formData);
  };

  if (isLoadingDept) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/departements")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier le département" : "Nouveau département"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations du département" : "Créez un nouveau département académique"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du département</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="INFO"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={errors.code ? "border-destructive" : ""}
                  maxLength={10}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="Informatique"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={errors.nom ? "border-destructive" : ""}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/departements")}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
