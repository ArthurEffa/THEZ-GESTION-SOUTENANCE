import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SalleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    batiment: "",
    capacite: "",
    equipements: [] as string[],
    est_disponible: true,
  });
  const [newEquipement, setNewEquipement] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddEquipement = () => {
    if (newEquipement.trim() && !formData.equipements.includes(newEquipement.trim())) {
      setFormData({
        ...formData,
        equipements: [...formData.equipements, newEquipement.trim()],
      });
      setNewEquipement("");
    }
  };

  const handleRemoveEquipement = (equipement: string) => {
    setFormData({
      ...formData,
      equipements: formData.equipements.filter((e) => e !== equipement),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    toast.success(isEditing ? "Salle modifiée avec succès" : "Salle créée avec succès");
    navigate("/salles");
  };

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

      <Card className="max-w-2xl">
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
                  placeholder="A101"
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
                <Input
                  id="batiment"
                  placeholder="Bâtiment A"
                  value={formData.batiment}
                  onChange={(e) => setFormData({ ...formData, batiment: e.target.value })}
                  className={errors.batiment ? "border-destructive" : ""}
                />
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

            <div className="space-y-2">
              <Label>Équipements</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Vidéoprojecteur, Tableau blanc..."
                  value={newEquipement}
                  onChange={(e) => setNewEquipement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEquipement();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddEquipement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.equipements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.equipements.map((equipement) => (
                    <Badge key={equipement} variant="secondary" className="gap-1">
                      {equipement}
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipement(equipement)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
