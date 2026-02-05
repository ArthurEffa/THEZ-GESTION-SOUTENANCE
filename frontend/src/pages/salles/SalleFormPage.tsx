import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import salleService, { SalleFormData } from "@/services/salleService";
import ajoutSalleHeroImg from "@/assets/illustrations/ajout-salle-hero.png";

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
    nom: "", batiment: "", capacite: "", est_disponible: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: salle, isLoading: isLoadingSalle } = useQuery({
    queryKey: ['salle', id],
    queryFn: () => salleService.getById(id!),
    enabled: isEditing && !!id,
  });

  useEffect(() => {
    if (salle) {
      setFormData({
        nom: salle.nom, batiment: salle.batiment,
        capacite: salle.capacite.toString(), est_disponible: salle.est_disponible,
      });
    }
  }, [salle]);

  const saveMutation = useMutation({
    mutationFn: (data: SalleFormData) =>
      isEditing && id ? salleService.update(id, data) : salleService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salles'] });
      toast.success(isEditing ? "Salle modifiée" : "Salle créée");
      navigate("/salles");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.batiment.trim()) newErrors.batiment = "Le bâtiment est requis";
    if (!formData.capacite || parseInt(formData.capacite) <= 0) newErrors.capacite = "Capacité > 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const dataToSend: SalleFormData = { ...formData, capacite: parseInt(formData.capacite) };
    saveMutation.mutate(dataToSend);
  };

  if (isLoadingSalle) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={() => navigate("/salles")} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />Retour
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Modifier la salle" : "Nouvelle salle"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Remplissez les informations pour {isEditing ? "modifier" : "créer"} une salle.
          </p>
        </div>
        <img src={ajoutSalleHeroImg} alt="Ajout salle" className="w-32 h-auto hidden md:block" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informations de la salle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label htmlFor="nom">Nom de la salle</Label>
                <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className={errors.nom ? "border-destructive" : ""} />
                {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
              </div>
              <div>
                <Label htmlFor="batiment">Bâtiment</Label>
                <Select value={formData.batiment} onValueChange={(value) => setFormData({ ...formData, batiment: value })}>
                  <SelectTrigger className={errors.batiment ? "border-destructive" : ""}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{BATIMENTS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
                {errors.batiment && <p className="text-sm text-destructive">{errors.batiment}</p>}
              </div>
              <div>
                <Label htmlFor="capacite">Capacité</Label>
                <Input id="capacite" type="number" value={formData.capacite} onChange={(e) => setFormData({ ...formData, capacite: e.target.value })} className={`max-w-[150px] ${errors.capacite ? "border-destructive" : ""}`} min={1} />
                {errors.capacite && <p className="text-sm text-destructive">{errors.capacite}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="est_disponible" checked={formData.est_disponible} onCheckedChange={(checked) => setFormData({ ...formData, est_disponible: checked as boolean })} />
                <Label htmlFor="est_disponible" className="font-normal">La salle est disponible pour les soutenances</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate("/salles")}>Annuler</Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
