import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import ajoutSalleHeroImg from "@/assets/illustrations/ajout-salle-hero.png";
import salleService, { SalleFormData } from "@/services/salleService";

const BATIMENTS = [
  "Bâtiment administratif",
  "Bâtiment pédagogique",
  "Bâtiment scolaire",
] as const;

export default function SalleFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<SalleFormData & { capacite: string }>({
    nom: "",
    batiment: "",
    capacite: "",
    est_disponible: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les données de la salle en mode édition
  const { data: salle, isLoading: isLoadingSalle } = useQuery({
    queryKey: ['salle', id],
    queryFn: () => salleService.getById(id!),
    enabled: isEditing && !!id,
  });

  // Remplir le formulaire avec les données chargées
  useEffect(() => {
    if (salle) {
      setFormData({
        nom: salle.nom,
        batiment: salle.batiment,
        capacite: salle.capacite.toString(),
        est_disponible: salle.est_disponible,
      });
    }
  }, [salle]);

  // Mutation pour créer/modifier
  const saveMutation = useMutation({
    mutationFn: (data: SalleFormData) => {
      if (isEditing && id) {
        return salleService.update(id, data);
      }
      return salleService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salles'] });
      toast.success(isEditing ? "Salle modifiée avec succès" : "Salle créée avec succès");
      navigate("/salles");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(errorMessage);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }
    if (!formData.batiment.trim()) {
      newErrors.batiment = "Le bâtiment est requis";
    }
    if (!formData.capacite || parseInt(formData.capacite) <= 0) {
      newErrors.capacite = "La capacité doit être supérieure à 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dataToSend: SalleFormData = {
      nom: formData.nom,
      batiment: formData.batiment,
      capacite: parseInt(formData.capacite),
      est_disponible: formData.est_disponible,
    };

    saveMutation.mutate(dataToSend);
  };

  if (isLoadingSalle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/salles")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier la salle" : "Nouvelle salle"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations de la salle" : "Ajoutez une nouvelle salle de soutenance"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations de la salle</CardTitle>
            <CardDescription>Renseignez les détails de la salle</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="17BS1..."
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={errors.nom ? "border-destructive" : ""}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batiment">
                  Bâtiment <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.batiment}
                  onValueChange={(value) => setFormData({ ...formData, batiment: value })}
                >
                  <SelectTrigger className={errors.batiment ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un bâtiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATIMENTS.map((batiment) => (
                      <SelectItem key={batiment} value={batiment}>
                        {batiment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batiment && (
                  <p className="text-sm text-destructive">{errors.batiment}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacite">
                Capacité <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="capacite"
                  type="number"
                  placeholder="50"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                  className={`max-w-[120px] ${errors.capacite ? "border-destructive" : ""}`}
                  min={1}
                />
                <span className="text-sm text-muted-foreground">personnes</span>
              </div>
              {errors.capacite && (
                <p className="text-sm text-destructive">{errors.capacite}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="est_disponible"
                checked={formData.est_disponible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, est_disponible: checked as boolean })
                }
              />
              <Label htmlFor="est_disponible" className="font-normal">
                Salle disponible pour les soutenances
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/salles")}>
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

      {/* Sidebar avec illustration */}
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-4 flex items-center justify-center">
            <div className="w-full h-48 overflow-hidden">
              <img
                src={ajoutSalleHeroImg}
                alt="Ajout d'une salle"
                className="w-full h-full object-contain"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {isEditing
                ? "Modifiez les informations de la salle. Vous pouvez mettre à jour son nom, son bâtiment, sa capacité et sa disponibilité."
                : "Ajoutez une nouvelle salle pour les soutenances. Renseignez son nom, son bâtiment, sa capacité et sa disponibilité."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
