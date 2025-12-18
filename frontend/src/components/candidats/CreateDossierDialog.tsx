import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import dossierService from "@/services/dossierService";
import sessionService from "@/services/sessionService";
import enseignantService from "@/services/enseignantService";

interface CreateDossierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatId: string;
  onSuccess: () => void;
}

export function CreateDossierDialog({
  open,
  onOpenChange,
  candidatId,
  onSuccess,
}: CreateDossierDialogProps) {
  const [formData, setFormData] = useState({
    titre_memoire: "",
    session_id: "",
    encadreur_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les sessions ouvertes
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions', 'open'],
    queryFn: () => sessionService.getAll({ statut: 'OUVERT' }),
  });

  // Charger les enseignants
  const { data: enseignants = [], isLoading: isLoadingEnseignants } = useQuery({
    queryKey: ['enseignants'],
    queryFn: () => enseignantService.getAll(),
  });

  // Mutation pour créer le dossier
  const createMutation = useMutation({
    mutationFn: () => dossierService.create({
      candidat_id: candidatId,
      session_id: formData.session_id,
      titre_memoire: formData.titre_memoire,
      encadreur_id: formData.encadreur_id || undefined,
    }),
    onSuccess: () => {
      toast.success("Dossier créé avec succès");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        titre_memoire: "",
        session_id: "",
        encadreur_id: "",
      });
      setErrors({});
    },
    onError: (error: any) => {
      console.error('Erreur création dossier:', error);
      const message = error?.response?.data?.detail ||
                     error?.response?.data?.message ||
                     "Erreur lors de la création du dossier";
      toast.error(message);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre_memoire.trim()) {
      newErrors.titre_memoire = "Le titre du mémoire est requis";
    }

    if (!formData.session_id) {
      newErrors.session_id = "La session est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un dossier de soutenance</DialogTitle>
            <DialogDescription>
              Créez un nouveau dossier pour ce candidat. Le candidat pourra ensuite remplir les détails et téléverser les documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                  {isLoadingSessions ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      Aucune session ouverte
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.titre} - {session.annee_academique}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.session_id && (
                <p className="text-sm text-destructive">{errors.session_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre_memoire">
                Titre du mémoire <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titre_memoire"
                placeholder="Titre du mémoire"
                value={formData.titre_memoire}
                onChange={(e) => setFormData({ ...formData, titre_memoire: e.target.value })}
                className={errors.titre_memoire ? "border-destructive" : ""}
              />
              {errors.titre_memoire && (
                <p className="text-sm text-destructive">{errors.titre_memoire}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="encadreur_id">Encadreur (optionnel)</Label>
              <div className="space-y-2">
                <Select
                  value={formData.encadreur_id}
                  onValueChange={(value) => setFormData({ ...formData, encadreur_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un encadreur" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEnseignants ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      enseignants.map((enseignant) => (
                        <SelectItem key={enseignant.id} value={enseignant.id}>
                          {enseignant.user.first_name} {enseignant.user.last_name} - {enseignant.grade}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.encadreur_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setFormData({ ...formData, encadreur_id: "" })}
                  >
                    Retirer l'encadreur
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le dossier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
