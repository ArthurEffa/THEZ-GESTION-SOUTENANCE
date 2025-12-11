import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  StatutSession, 
  NiveauEtude,
  STATUT_SESSION_LABELS,
  NIVEAU_ETUDE_LABELS
} from "@/types/models";

const STATUTS: StatutSession[] = ['OUVERT', 'FERME', 'EN_COURS', 'TERMINE'];
const NIVEAUX: NiveauEtude[] = ['LICENCE', 'MASTER', 'DOCTORAT'];

export default function SessionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titre: "",
    annee_academique: "2024-2025",
    date_ouverture: "",
    date_cloture: "",
    niveau_concerne: "" as NiveauEtude | "",
    statut: "OUVERT" as StatutSession,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titre.trim()) {
      newErrors.titre = "Le titre est requis";
    }
    if (!formData.annee_academique.trim()) {
      newErrors.annee_academique = "L'année académique est requise";
    }
    if (!formData.date_ouverture) {
      newErrors.date_ouverture = "La date d'ouverture est requise";
    }
    if (!formData.date_cloture) {
      newErrors.date_cloture = "La date de clôture est requise";
    }
    if (formData.date_ouverture && formData.date_cloture && formData.date_ouverture > formData.date_cloture) {
      newErrors.date_cloture = "La date de clôture doit être après la date d'ouverture";
    }
    if (!formData.niveau_concerne) {
      newErrors.niveau_concerne = "Le niveau concerné est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    toast.success(isEditing ? "Session modifiée avec succès" : "Session créée avec succès");
    navigate("/sessions");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sessions")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier la session" : "Nouvelle session"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations de la session" : "Créez une nouvelle session de soutenance"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de la session</CardTitle>
          <CardDescription>Définissez les paramètres de la session de soutenance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titre">
                Titre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titre"
                placeholder="Session Master 2024-2025"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className={errors.titre ? "border-destructive" : ""}
              />
              {errors.titre && <p className="text-sm text-destructive">{errors.titre}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="annee_academique">
                  Année académique <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="annee_academique"
                  placeholder="2024-2025"
                  value={formData.annee_academique}
                  onChange={(e) => setFormData({ ...formData, annee_academique: e.target.value })}
                  className={errors.annee_academique ? "border-destructive" : ""}
                />
                {errors.annee_academique && <p className="text-sm text-destructive">{errors.annee_academique}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="niveau_concerne">
                  Niveau concerné <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.niveau_concerne}
                  onValueChange={(value) => setFormData({ ...formData, niveau_concerne: value as NiveauEtude })}
                >
                  <SelectTrigger className={errors.niveau_concerne ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEAUX.map((niveau) => (
                      <SelectItem key={niveau} value={niveau}>
                        {NIVEAU_ETUDE_LABELS[niveau]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.niveau_concerne && <p className="text-sm text-destructive">{errors.niveau_concerne}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_ouverture">
                  Date d'ouverture <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date_ouverture"
                  type="datetime-local"
                  value={formData.date_ouverture}
                  onChange={(e) => setFormData({ ...formData, date_ouverture: e.target.value })}
                  className={errors.date_ouverture ? "border-destructive" : ""}
                />
                {errors.date_ouverture && <p className="text-sm text-destructive">{errors.date_ouverture}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_cloture">
                  Date de clôture <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date_cloture"
                  type="datetime-local"
                  value={formData.date_cloture}
                  onChange={(e) => setFormData({ ...formData, date_cloture: e.target.value })}
                  className={errors.date_cloture ? "border-destructive" : ""}
                />
                {errors.date_cloture && <p className="text-sm text-destructive">{errors.date_cloture}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({ ...formData, statut: value as StatutSession })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((statut) => (
                    <SelectItem key={statut} value={statut}>
                      {STATUT_SESSION_LABELS[statut]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la session..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/sessions")}>
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
