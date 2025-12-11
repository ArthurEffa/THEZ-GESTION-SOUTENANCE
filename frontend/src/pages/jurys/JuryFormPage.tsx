import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  StatutJury, 
  RoleMembreJury, 
  STATUT_JURY_LABELS, 
  ROLE_MEMBRE_JURY_LABELS 
} from "@/types/models";

const STATUTS_JURY: StatutJury[] = ['PROPOSE', 'VALIDE', 'ACTIF'];
const ROLES_MEMBRE: RoleMembreJury[] = ['PRESIDENT', 'RAPPORTEUR', 'ENCADREUR', 'EXAMINATEUR'];

// Demo data - enseignants disponibles
const enseignantsDisponibles = [
  { id: "1", nom: "Jean Dupont", grade: "Professeur", specialite: "IA" },
  { id: "2", nom: "Marie Martin", grade: "Maître de Conférence", specialite: "Réseaux" },
  { id: "3", nom: "Paul Bernard", grade: "Chargé de Cours", specialite: "Cybersécurité" },
  { id: "4", nom: "Sophie Lefebvre", grade: "Professeur", specialite: "BDD" },
  { id: "5", nom: "Pierre Durand", grade: "Assistant", specialite: "Systèmes embarqués" },
];

// Demo data - sessions disponibles
const sessionsDisponibles = [
  { id: "1", titre: "Session Master 2024-2025", annee: "2024-2025" },
  { id: "2", titre: "Session Licence 2024-2025", annee: "2024-2025" },
];

interface MembreJuryForm {
  enseignant_id: string;
  role: RoleMembreJury | "";
}

export default function JuryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    session_id: "",
    statut: "PROPOSE" as StatutJury,
    membres: [] as MembreJuryForm[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du jury est requis";
    }
    if (!formData.session_id) {
      newErrors.session_id = "La session est requise";
    }
    if (formData.membres.length === 0) {
      newErrors.membres = "Au moins un membre est requis";
    }
    // Vérifier que chaque membre a un enseignant et un rôle
    formData.membres.forEach((membre, index) => {
      if (!membre.enseignant_id) {
        newErrors[`membre_${index}_enseignant`] = "Enseignant requis";
      }
      if (!membre.role) {
        newErrors[`membre_${index}_role`] = "Rôle requis";
      }
    });
    // Vérifier qu'il y a un président
    const hasPresident = formData.membres.some((m) => m.role === "PRESIDENT");
    if (formData.membres.length > 0 && !hasPresident) {
      newErrors.president = "Le jury doit avoir un président";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMembre = () => {
    setFormData({
      ...formData,
      membres: [...formData.membres, { enseignant_id: "", role: "" }],
    });
  };

  const handleRemoveMembre = (index: number) => {
    setFormData({
      ...formData,
      membres: formData.membres.filter((_, i) => i !== index),
    });
  };

  const handleMembreChange = (index: number, field: keyof MembreJuryForm, value: string) => {
    const newMembres = [...formData.membres];
    newMembres[index] = { ...newMembres[index], [field]: value };
    setFormData({ ...formData, membres: newMembres });
  };

  const getEnseignantName = (id: string) => {
    return enseignantsDisponibles.find((e) => e.id === id)?.nom || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    toast.success(isEditing ? "Jury modifié avec succès" : "Jury créé avec succès");
    navigate("/jurys");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/jurys")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier le jury" : "Nouveau jury"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez la composition du jury" : "Créez un nouveau jury de soutenance"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Identifiez le jury et sa session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom du jury <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="Jury Master Informatique 2024"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={errors.nom ? "border-destructive" : ""}
                />
                {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) => setFormData({ ...formData, statut: value as StatutJury })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS_JURY.map((statut) => (
                        <SelectItem key={statut} value={statut}>
                          {STATUT_JURY_LABELS[statut]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composition du jury</CardTitle>
              <CardDescription>Ajoutez les membres et leurs rôles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.membres && (
                <p className="text-sm text-destructive">{errors.membres}</p>
              )}
              {errors.president && (
                <p className="text-sm text-destructive">{errors.president}</p>
              )}

              {formData.membres.map((membre, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                  <div className="flex-1 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Enseignant</Label>
                      <Select
                        value={membre.enseignant_id}
                        onValueChange={(value) => handleMembreChange(index, "enseignant_id", value)}
                      >
                        <SelectTrigger className={errors[`membre_${index}_enseignant`] ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {enseignantsDisponibles
                            .filter(
                              (e) =>
                                !formData.membres.some(
                                  (m, i) => i !== index && m.enseignant_id === e.id
                                )
                            )
                            .map((enseignant) => (
                              <SelectItem key={enseignant.id} value={enseignant.id}>
                                {enseignant.nom} - {enseignant.grade}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rôle</Label>
                      <Select
                        value={membre.role}
                        onValueChange={(value) => handleMembreChange(index, "role", value)}
                      >
                        <SelectTrigger className={errors[`membre_${index}_role`] ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES_MEMBRE.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_MEMBRE_JURY_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMembre(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={handleAddMembre} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un membre
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/jurys")}>
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
