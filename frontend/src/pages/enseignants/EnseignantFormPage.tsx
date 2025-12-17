import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GradeEnseignant, GRADE_ENSEIGNANT_LABELS, Departement } from "@/types/models";
import enseignantService, { EnseignantFormData } from "@/services/enseignantService";
import departementService from "@/services/departementService";

const GRADES: GradeEnseignant[] = ['PROFESSEUR', 'MAITRE_CONF', 'CHARGE_COURS', 'ASSISTANT'];

export default function EnseignantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<EnseignantFormData>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    phone: "",
    grade: "PROFESSEUR",
    departement_ids: [],
  });

  const [departements, setDepartements] = useState<Departement[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Charger les départements
  useEffect(() => {
    const loadDepartements = async () => {
      try {
        const data = await departementService.getAll();
        setDepartements(data);
      } catch (error: any) {
        console.error('Erreur lors du chargement des départements:', error);
        toast.error('Erreur lors du chargement des départements');
      }
    };
    loadDepartements();
  }, []);

  // Charger les données de l'enseignant en mode édition
  useEffect(() => {
    if (isEditing && id) {
      const loadEnseignant = async () => {
        setIsLoadingData(true);
        try {
          const enseignant = await enseignantService.getById(id);
          setFormData({
            email: enseignant.user.email,
            username: enseignant.user.username,
            first_name: enseignant.user.first_name,
            last_name: enseignant.user.last_name,
            password: "",
            phone: enseignant.user.phone || "",
            grade: enseignant.grade,
            departement_ids: enseignant.departements.map(d => d.id),
          });
        } catch (error: any) {
          console.error('Erreur lors du chargement de l\'enseignant:', error);
          toast.error('Erreur lors du chargement de l\'enseignant');
          navigate("/enseignants");
        } finally {
          setIsLoadingData(false);
        }
      };
      loadEnseignant();
    }
  }, [isEditing, id, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    }
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au minimum 8 caractères";
    }
    if (!formData.grade) {
      newErrors.grade = "Le grade est requis";
    }
    if (formData.departement_ids.length === 0) {
      newErrors.departement_ids = "Au moins un département est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartementToggle = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      departement_ids: prev.departement_ids.includes(deptId)
        ? prev.departement_ids.filter((id) => id !== deptId)
        : [...prev.departement_ids, deptId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && id) {
        // Mode édition
        const updateData: Partial<EnseignantFormData> = {
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          grade: formData.grade,
          departement_ids: formData.departement_ids,
        };

        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password) {
          updateData.password = formData.password;
        }

        await enseignantService.update(id, updateData);
        toast.success("Enseignant modifié avec succès");
      } else {
        // Mode création
        await enseignantService.create(formData);
        toast.success("Enseignant créé avec succès");
      }

      navigate("/enseignants");
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);

      // Gérer les erreurs spécifiques du backend
      if (error.response?.data) {
        const backendErrors = error.response.data;

        // Si c'est un objet d'erreurs de validation
        if (typeof backendErrors === 'object') {
          const newErrors: Record<string, string> = {};

          Object.keys(backendErrors).forEach((key) => {
            const errorMessages = backendErrors[key];
            if (Array.isArray(errorMessages)) {
              newErrors[key] = errorMessages[0];
            } else if (typeof errorMessages === 'string') {
              newErrors[key] = errorMessages;
            }
          });

          setErrors(newErrors);
          toast.error("Erreur de validation du formulaire");
        } else {
          toast.error(backendErrors.detail || "Erreur lors de la sauvegarde");
        }
      } else {
        toast.error(
          isEditing
            ? "Erreur lors de la modification de l'enseignant"
            : "Erreur lors de la création de l'enseignant"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/enseignants")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier l'enseignant" : "Nouvel enseignant"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations de l'enseignant" : "Ajoutez un nouvel enseignant"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
          <CardDescription>Données de connexion et coordonnées</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@ecole.fr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Nom d'utilisateur <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="jean.dupont"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Prénom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Jean"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={errors.first_name ? "border-destructive" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Dupont"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className={errors.last_name ? "border-destructive" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isEditing ? "Laisser vide pour ne pas modifier" : "Min. 8 caractères"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password ? (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  ) : !isEditing ? (
                    <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Profil enseignant</h3>
                <p className="text-sm text-muted-foreground">
                  Informations professionnelles de l'enseignant
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">
                  Grade <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value as GradeEnseignant })}
                >
                  <SelectTrigger className={errors.grade ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner le grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {GRADE_ENSEIGNANT_LABELS[grade]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && (
                  <p className="text-sm text-destructive">{errors.grade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Départements <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sélectionnez les départements auxquels l'enseignant est rattaché
                </p>
                <div className="grid gap-2 md:grid-cols-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {departements.map((dept) => (
                    <div key={dept.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept.id}`}
                        checked={formData.departement_ids.includes(dept.id)}
                        onCheckedChange={() => handleDepartementToggle(dept.id)}
                      />
                      <Label htmlFor={`dept-${dept.id}`} className="font-normal text-sm cursor-pointer">
                        {dept.code} - {dept.nom}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.departement_ids && (
                  <p className="text-sm text-destructive">{errors.departement_ids}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/enseignants")}>
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
