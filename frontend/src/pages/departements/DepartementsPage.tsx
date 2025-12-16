import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import departmentsHeroImage from "@/assets/illustrations/departments-hero.png";
import departementService, { Departement } from "@/services/departementService";
import { Loader2 } from "lucide-react";

export default function DepartementsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; departement: Departement | null }>({
    open: false,
    departement: null,
  });

  // Récupération des départements depuis l'API
  const { data: departements = [], isLoading, error } = useQuery({
    queryKey: ['departements'],
    queryFn: () => departementService.getAll(),
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departements'] });
      toast.success(`Département supprimé avec succès`);
      setDeleteDialog({ open: false, departement: null });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du département");
    },
  });

  const filteredDepartements = departements.filter(
    (f) =>
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.departement) {
      deleteMutation.mutate(deleteDialog.departement.id);
    }
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
        <p className="text-destructive">Erreur lors du chargement des départements</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['departements'] })}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero section avec illustration */}
      <div className="flex flex-col lg:flex-row items-center gap-6 p-6 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Départements</h1>
          <p className="text-muted-foreground">
            Gérez les départements académiques de l'établissement
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/departements/nouveau")}
          >
            Ajouter un département
          </Button>
        </div>
        <div className="w-full lg:w-72 h-48 flex items-center justify-center">
          <img 
            src={departmentsHeroImage} 
            alt="Illustration des départements" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Rechercher un département..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Grid de départements avec espaces pour illustrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartements.map((departement) => (
          <Card
            key={departement.id}
            className="group hover:shadow-md transition-shadow cursor-pointer border-border/60"
            onClick={() => navigate(`/departements/${departement.id}`)}
          >
            <CardContent className="p-0">
              {/* Espace réservé pour illustration */}
              <div className="h-32 bg-muted/30 border-b border-border/40 flex items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-muted/50 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-muted-foreground/40">{departement.code.charAt(0)}</span>
                  </div>
                  <span className="text-xs">Illustration à ajouter</span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                        {departement.code}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">
                      {departement.nom}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{departement.nb_candidats} candidats</span>
                    <span>{departement.nb_enseignants} enseignants</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/departements/${departement.id}/modifier`);
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
                        setDeleteDialog({ open: true, departement });
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

      {filteredDepartements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun département trouvé
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, departement: null })}
        title="Supprimer le département"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.departement?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
