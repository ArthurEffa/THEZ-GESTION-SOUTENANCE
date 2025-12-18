import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
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
import juryService from "@/services/juryService";
import enseignantService from "@/services/enseignantService";
import sessionService from "@/services/sessionService";
import {
  StatutJury,
  RoleMembreJury,
  STATUT_JURY_LABELS,
  ROLE_MEMBRE_JURY_LABELS
} from "@/types/models";

const STATUTS_JURY: StatutJury[] = ['PROPOSE', 'VALIDE', 'ACTIF'];
const ROLES_MEMBRE: RoleMembreJury[] = ['PRESIDENT', 'RAPPORTEUR', 'ENCADREUR', 'EXAMINATEUR'];

interface MembreJuryForm {
  enseignant_id: string;
  role: RoleMembreJury | "";
}

export default function JuryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nom: "",
    session_id: "",
    statut: "PROPOSE" as StatutJury,
    membres_data: [] as MembreJuryForm[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les enseignants disponibles
  const { data: enseignants = [], isLoading: isLoadingEnseignants } = useQuery({
    queryKey: ['enseignants'],
    queryFn: () => enseignantService.getAll(),
  });

  // Charger les sessions disponibles (uniquement ouvertes)
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions', 'open'],
    queryFn: () => sessionService.getAll({ statut: 'OUVERT' }),
  });

  // Charger les données du jury si édition
  const { data: jury, isLoading: isLoadingJury } = useQuery({
    queryKey: ['jury', id],
    queryFn: () => juryService.getById(id!),
    enabled: isEditing,
  });

  // Remplir le formulaire avec les données chargées
  useEffect(() => {
    if (jury) {
      setFormData({
        nom: jury.nom,
        session_id: jury.session_id,
        statut: jury.statut,
        membres_data: jury.composition?.map(m => ({
          enseignant_id: m.enseignant_id,
          role: m.role,
        })) || [],
      });
    }
  }, [jury]);

  // Mutation pour créer/modifier
  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        // Pour l'édition, on ne peut changer que le nom et la session
        return juryService.update(id!, {
          nom: data.nom,
          session_id: data.session_id,
        });
      } else {
        return juryService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurys'] });
      toast.success(isEditing ? "Jury modifié avec succès" : "Jury créé avec succès");
      navigate("/jurys");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail ||
                     error?.response?.data?.message ||
                     "Erreur lors de la sauvegarde";
      toast.error(message);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du jury est requis";
    }
    if (!formData.session_id) {
      newErrors.session_id = "La session est requise";
    }
    if (!isEditing && formData.membres_data.length === 0) {
      newErrors.membres = "Au moins un membre est requis";
    }
    // Vérifier que chaque membre a un enseignant et un rôle
    formData.membres_data.forEach((membre, index) => {
      if (!membre.enseignant_id) {
        newErrors[`membre_${index}_enseignant`] = "Enseignant requis";
      }
      if (!membre.role) {
        newErrors[`membre_${index}_role`] = "Rôle requis";
      }
    });
    // Vérifier qu'il y a un président
    const hasPresident = formData.membres_data.some((m) => m.role === "PRESIDENT");
    if (!isEditing && formData.membres_data.length > 0 && !hasPresident) {
      newErrors.president = "Le jury doit avoir un président";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMembre = () => {
    setFormData({
      ...formData,
      membres_data: [...formData.membres_data, { enseignant_id: "", role: "" }],
    });
  };

  const handleRemoveMembre = (index: number) => {
    setFormData({
      ...formData,
      membres_data: formData.membres_data.filter((_, i) => i !== index),
    });
  };

  const handleMembreChange = (index: number, field: keyof MembreJuryForm, value: string) => {
    const newMembres = [...formData.membres_data];
    newMembres[index] = { ...newMembres[index], [field]: value };
    setFormData({ ...formData, membres_data: newMembres });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate(formData);
  };

  if (isLoadingJury || isLoadingEnseignants || isLoadingSessions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                      {sessions.map((session) => (
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

              {formData.membres_data.map((membre, index) => (
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
                          {enseignants
                            .filter(
                              (e) =>
                                !formData.membres_data.some(
                                  (m, i) => i !== index && m.enseignant_id === e.id
                                )
                            )
                            .map((enseignant) => (
                              <SelectItem key={enseignant.id} value={enseignant.id}>
                                {enseignant.user.first_name} {enseignant.user.last_name} - {enseignant.grade}
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
                          {ROLES_MEMBRE
                            .filter(
                              (role) =>
                                // Afficher le rôle s'il n'est pas encore utilisé, ou si c'est le rôle actuel du membre
                                !formData.membres_data.some(
                                  (m, i) => i !== index && m.role === role
                                )
                            )
                            .map((role) => (
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
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
      </div>
    </div>
  );
}
