import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Clock } from "lucide-react";
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
  StatutSoutenance, 
  STATUT_SOUTENANCE_LABELS 
} from "@/types/models";

const STATUTS: StatutSoutenance[] = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

// Demo data - dossiers validés disponibles pour soutenance
const dossiersDisponibles = [
  { 
    id: "1", 
    titre_memoire: "Développement d'une application IoT pour l'agriculture", 
    candidat: "Marie Martin",
    matricule: "ET2024001",
    departement: "Génie Informatique"
  },
  { 
    id: "2", 
    titre_memoire: "Étude des structures de ponts suspendus", 
    candidat: "Paul Dubois",
    matricule: "ET2024002",
    departement: "Génie Civil"
  },
  { 
    id: "3", 
    titre_memoire: "Optimisation des réseaux de neurones convolutifs", 
    candidat: "Sophie Lefebvre",
    matricule: "ET2024003",
    departement: "Génie Informatique"
  },
];

// Demo data - jurys disponibles
const jurysDisponibles = [
  { id: "1", nom: "Jury Master Informatique 2024" },
  { id: "2", nom: "Jury Génie Civil 2024" },
];

// Demo data - sessions disponibles
const sessionsDisponibles = [
  { id: "1", titre: "Session Master 2024-2025" },
  { id: "2", titre: "Session Licence 2024-2025" },
];

// Demo data - salles disponibles
const sallesDisponibles = [
  { id: "1", nom: "A101", batiment: "Bâtiment A" },
  { id: "2", nom: "A102", batiment: "Bâtiment A" },
  { id: "3", nom: "B204", batiment: "Bâtiment B" },
  { id: "4", nom: "C302", batiment: "Bâtiment C" },
];

export default function SoutenanceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    dossier_id: "",
    jury_id: "",
    session_id: "",
    salle_id: "",
    date_heure: "",
    heure: "",
    duree_minutes: "60",
    ordre_passage: "",
    statut: "PLANIFIEE" as StatutSoutenance,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const heureFin = useMemo(() => {
    if (!formData.heure || !formData.duree_minutes) return "";
    const [hours, minutes] = formData.heure.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(formData.duree_minutes);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  }, [formData.heure, formData.duree_minutes]);

  const selectedDossier = dossiersDisponibles.find((d) => d.id === formData.dossier_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dossier_id) {
      newErrors.dossier_id = "Le dossier est requis";
    }
    if (!formData.session_id) {
      newErrors.session_id = "La session est requise";
    }
    if (!formData.date_heure) {
      newErrors.date_heure = "La date est requise";
    }
    if (!formData.heure) {
      newErrors.heure = "L'heure est requise";
    }
    if (!formData.duree_minutes || parseInt(formData.duree_minutes) < 15 || parseInt(formData.duree_minutes) > 240) {
      newErrors.duree_minutes = "La durée doit être entre 15 et 240 minutes";
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

    toast.success(isEditing ? "Soutenance modifiée avec succès" : "Soutenance planifiée avec succès");
    navigate("/soutenances");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/soutenances")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier la soutenance" : "Planifier une soutenance"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations de la soutenance" : "Planifiez une nouvelle soutenance"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dossier de soutenance</CardTitle>
              <CardDescription>Sélectionnez le dossier validé à soutenir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dossier_id">
                  Dossier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.dossier_id}
                  onValueChange={(value) => setFormData({ ...formData, dossier_id: value })}
                >
                  <SelectTrigger className={errors.dossier_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un dossier" />
                  </SelectTrigger>
                  <SelectContent>
                    {dossiersDisponibles.map((dossier) => (
                      <SelectItem key={dossier.id} value={dossier.id}>
                        {dossier.candidat} ({dossier.matricule}) - {dossier.departement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dossier_id && <p className="text-sm text-destructive">{errors.dossier_id}</p>}
              </div>

              {selectedDossier && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="font-medium">{selectedDossier.titre_memoire}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDossier.candidat} - {selectedDossier.matricule}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="session_id">
                  Session <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.session_id}
                  onValueChange={(value) => setFormData({ ...formData, session_id: value })}
                >
                  <SelectTrigger className={errors.session_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner une session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionsDisponibles.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.session_id && <p className="text-sm text-destructive">{errors.session_id}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planning</CardTitle>
              <CardDescription>Définissez la date, l'heure et le lieu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date_heure">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date_heure"
                    type="date"
                    value={formData.date_heure}
                    onChange={(e) => setFormData({ ...formData, date_heure: e.target.value })}
                    className={errors.date_heure ? "border-destructive" : ""}
                  />
                  {errors.date_heure && <p className="text-sm text-destructive">{errors.date_heure}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heure">
                    Heure <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="heure"
                    type="time"
                    value={formData.heure}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    className={errors.heure ? "border-destructive" : ""}
                  />
                  {errors.heure && <p className="text-sm text-destructive">{errors.heure}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree_minutes">
                    Durée (min) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duree_minutes"
                    type="number"
                    min={15}
                    max={240}
                    value={formData.duree_minutes}
                    onChange={(e) => setFormData({ ...formData, duree_minutes: e.target.value })}
                    className={errors.duree_minutes ? "border-destructive" : ""}
                  />
                  {errors.duree_minutes && <p className="text-sm text-destructive">{errors.duree_minutes}</p>}
                </div>
              </div>

              {heureFin && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Heure de fin: <span className="font-medium text-foreground">{heureFin}</span>
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salle_id">Salle</Label>
                  <Select
                    value={formData.salle_id}
                    onValueChange={(value) => setFormData({ ...formData, salle_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {sallesDisponibles.map((salle) => (
                        <SelectItem key={salle.id} value={salle.id}>
                          {salle.nom} - {salle.batiment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ordre_passage">Ordre de passage</Label>
                  <Input
                    id="ordre_passage"
                    type="number"
                    min={1}
                    placeholder="1"
                    value={formData.ordre_passage}
                    onChange={(e) => setFormData({ ...formData, ordre_passage: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jury</CardTitle>
              <CardDescription>Assignez un jury à cette soutenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jury_id">Jury</Label>
                <Select
                  value={formData.jury_id}
                  onValueChange={(value) => setFormData({ ...formData, jury_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jury" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurysDisponibles.map((jury) => (
                      <SelectItem key={jury.id} value={jury.id}>
                        {jury.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value) => setFormData({ ...formData, statut: value as StatutSoutenance })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUTS.map((statut) => (
                      <SelectItem key={statut} value={statut}>
                        {STATUT_SOUTENANCE_LABELS[statut]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/soutenances")}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
