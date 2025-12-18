import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import juryService from "@/services/juryService";
import { Jury, STATUT_JURY_LABELS, StatutJury } from "@/types/models";
import { Loader2, Users, Award } from "lucide-react";
import juryHeroImage from "@/assets/illustrations/jurys-hero.png";

const STATUT_COLORS: Record<StatutJury, string> = {
  PROPOSE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  VALIDE: "bg-green-100 text-green-800 border-green-200",
  ACTIF: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function JurysPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jury: Jury | null }>({
    open: false,
    jury: null,
  });

  // Récupération des jurys depuis l'API
  const { data: jurys = [], isLoading, error } = useQuery({
    queryKey: ['jurys'],
    queryFn: () => juryService.getAll(),
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id: string) => juryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurys'] });
      toast.success(`Jury supprimé avec succès`);
      setDeleteDialog({ open: false, jury: null });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du jury");
    },
  });

  // Mutation pour valider un jury
  const validerMutation = useMutation({
    mutationFn: (id: string) => juryService.valider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurys'] });
      toast.success("Jury validé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la validation du jury");
    },
  });

  // Mutation pour activer un jury
  const activerMutation = useMutation({
    mutationFn: (id: string) => juryService.activer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurys'] });
      toast.success("Jury activé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'activation du jury");
    },
  });

  const filteredJurys = jurys.filter(
    (jury) =>
      jury.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jury.session?.titre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.jury) {
      deleteMutation.mutate(deleteDialog.jury.id);
    }
  };

  const getPresidentName = (jury: Jury): string => {
    const president = jury.composition?.find(m => m.role === 'PRESIDENT');
    if (!president) return 'Non défini';
    // Le backend renvoie nom_complet dans SimpleEnseignantProfileSerializer
    return president.enseignant.nom_complet || `${president.enseignant.user?.first_name || ''} ${president.enseignant.user?.last_name || ''}`.trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement des jurys</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['jurys'] })}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Jurys de soutenance</h1>
          <p className="text-muted-foreground">
            Composez et gérez les jurys pour les soutenances
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/jurys/nouveau")}
          >
            Composer un jury
          </Button>
        </div>
        <div className="w-full lg:w-72 h-48 flex items-center justify-center">
          <img
            src={juryHeroImage}
            alt="Illustration gestion des jurys"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Rechercher un jury..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Grid de jurys */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJurys.map((jury) => (
          <Card
            key={jury.id}
            className="group hover:shadow-md transition-shadow cursor-pointer border-border/60"
            onClick={() => navigate(`/jurys/${jury.id}`)}
          >
            <CardContent className="p-0">
              {/* Header avec badge statut */}
              <div className="p-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-tight flex-1">
                    {jury.nom}
                  </h3>
                  <Badge
                    variant="outline"
                    className={STATUT_COLORS[jury.statut]}
                  >
                    {STATUT_JURY_LABELS[jury.statut]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {jury.session?.titre || 'Session non définie'}
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-3.5 w-3.5" />
                    <span className="font-medium">Président:</span>
                    <span>{getPresidentName(jury)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{jury.composition?.length || 0} membres</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex gap-2">
                    {jury.statut === 'PROPOSE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          validerMutation.mutate(jury.id);
                        }}
                      >
                        Valider
                      </Button>
                    )}
                    {jury.statut === 'VALIDE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          activerMutation.mutate(jury.id);
                        }}
                      >
                        Activer
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jurys/${jury.id}/modifier`);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, jury });
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJurys.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun jury trouvé
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, jury: null })}
        title="Supprimer le jury"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.jury?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
