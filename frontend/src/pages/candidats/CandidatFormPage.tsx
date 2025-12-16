import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
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
import { DEPARTMENTS } from "@/config/departments";
import { NiveauEtude, NIVEAU_ETUDE_LABELS } from "@/types/models";
import ajoutCandidatHeroImg from "@/assets/illustrations/ajout-etudiant-hero.png";

const NIVEAUX_ETUDE: NiveauEtude[] = ['LICENCE', 'MASTER', 'DOCTORAT'];

export default function CandidatFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    // CustomUser fields
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    phone: "",
    // CandidatProfile fields
    matricule: "",
    niveau_etude: "" as NiveauEtude | "",
    departement_id: "",
    specialite: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    }
    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
    }
    if (!formData.niveau_etude) {
      newErrors.niveau_etude = "Le niveau d'étude est requis";
    }
    if (!formData.departement_id) {
      newErrors.departement_id = "Le département est requis";
    }
    if (!formData.specialite.trim()) {
      newErrors.specialite = "La spécialité est requise";
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

    toast.success(isEditing ? "Candidat modifié avec succès" : "Candidat créé avec succès");
    navigate("/candidats");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/candidats")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier le candidat" : "Nouveau candidat"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifiez les informations du candidat" : "Inscrivez un nouveau candidat"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
                    placeholder="marie.martin@etu.fr"
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
                    placeholder="marie.martin"
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
                    placeholder="Marie"
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
                    placeholder="Martin"
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
                    placeholder={isEditing ? "Laisser vide pour ne pas modifier" : "********"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
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
                <h3 className="text-lg font-medium">Profil candidat</h3>
                <p className="text-sm text-muted-foreground">
                  Informations académiques du candidat
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="matricule">
                    Matricule <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="matricule"
                    placeholder="ET2024001"
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value.toUpperCase() })}
                    className={errors.matricule ? "border-destructive" : ""}
                  />
                  {errors.matricule && (
                    <p className="text-sm text-destructive">{errors.matricule}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niveau_etude">
                    Niveau d'étude <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.niveau_etude}
                    onValueChange={(value) => setFormData({ ...formData, niveau_etude: value as NiveauEtude })}
                  >
                    <SelectTrigger className={errors.niveau_etude ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionner le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVEAUX_ETUDE.map((niveau) => (
                        <SelectItem key={niveau} value={niveau}>
                          {NIVEAU_ETUDE_LABELS[niveau]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.niveau_etude && (
                    <p className="text-sm text-destructive">{errors.niveau_etude}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departement_id">
                  Département <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.departement_id}
                  onValueChange={(value) => setFormData({ ...formData, departement_id: value })}
                >
                  <SelectTrigger className={errors.departement_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departement_id && (
                  <p className="text-sm text-destructive">{errors.departement_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialite">
                  Spécialité <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="specialite"
                  placeholder="Intelligence Artificielle, Réseaux, etc."
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  className={errors.specialite ? "border-destructive" : ""}
                />
                {errors.specialite && (
                  <p className="text-sm text-destructive">{errors.specialite}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/candidats")}>
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

      {/* Sidebar avec illustration */}
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-4 flex items-center justify-center">
            <div className="w-full h-48 overflow-hidden">
              <img
                src={ajoutCandidatHeroImg}
                alt="Ajout d'un candidat"
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
                ? "Modifiez les informations du candidat. Les champs marqués d'un astérisque (*) sont obligatoires."
                : "Créez un nouveau compte candidat. Un email et un mot de passe lui seront attribués pour accéder à son espace personnel."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
