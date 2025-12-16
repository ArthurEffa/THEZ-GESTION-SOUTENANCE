import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, X, Loader2 } from "lucide-react";
import sallesHeroImage from "@/assets/illustrations/salles-hero.png";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import salleService, { Salle } from "@/services/salleService";

export default function SallesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterDisponible, setFilterDisponible] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; salle: Salle | null }>({
    open: false,
    salle: null,
  });

  // Récupération des salles depuis l'API
  const { data: salles = [], isLoading, error } = useQuery({
    queryKey: ['salles'],
    queryFn: () => salleService.getAll(),
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id: string) => salleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salles'] });
      toast.success(`Salle supprimée avec succès`);
      setDeleteDialog({ open: false, salle: null });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la salle");
    },
  });

  const filteredSalles = salles.filter((salle) => {
    if (filterDisponible === "all") return true;
    return filterDisponible === "disponible" ? salle.est_disponible : !salle.est_disponible;
  });

  const columns: Column<Salle>[] = [
    {
      key: "nom",
      header: "Nom",
      render: (salle) => <span className="font-medium">{salle.nom}</span>,
    },
    {
      key: "batiment",
      header: "Bâtiment",
      render: (salle) => (
        <span className="text-muted-foreground">{salle.batiment}</span>
      ),
    },
    {
      key: "capacite",
      header: "Capacité",
      render: (salle) => (
        <span className="text-muted-foreground">{salle.capacite} places</span>
      ),
    },
    {
      key: "est_disponible",
      header: "Disponibilité",
      render: (salle) => (
        <Badge variant={salle.est_disponible ? "default" : "secondary"} className="gap-1">
          {salle.est_disponible ? (
            <>
              <Check className="h-3 w-3" /> Disponible
            </>
          ) : (
            <>
              <X className="h-3 w-3" /> Indisponible
            </>
          )}
        </Badge>
      ),
    },
  ];

  const handleDelete = () => {
    if (deleteDialog.salle) {
      deleteMutation.mutate(deleteDialog.salle.id);
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
        <p className="text-destructive">Erreur lors du chargement des salles</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['salles'] })}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Salles"
          description="Gérez les salles de soutenance disponibles"
          icon={Building2}
          action={{
            label: "Ajouter une salle",
            onClick: () => navigate("/salles/nouveau"),
          }}
        >
          <Select value={filterDisponible} onValueChange={setFilterDisponible}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les salles</SelectItem>
              <SelectItem value="disponible">Disponibles</SelectItem>
              <SelectItem value="indisponible">Indisponibles</SelectItem>
            </SelectContent>
          </Select>
        </PageHeader>
        <img 
          src={sallesHeroImage} 
          alt="Illustration gestion des salles" 
          className="hidden lg:block w-48 opacity-90"
        />
      </div>

      <DataTable
        data={filteredSalles}
        columns={columns}
        searchPlaceholder="Rechercher une salle..."
        onView={(salle) => navigate(`/salles/${salle.id}`)}
        onEdit={(salle) => navigate(`/salles/${salle.id}/modifier`)}
        onDelete={(salle) => setDeleteDialog({ open: true, salle })}
        emptyMessage="Aucune salle enregistrée"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, salle: null })}
        title="Supprimer la salle"
        description={`Êtes-vous sûr de vouloir supprimer la salle "${deleteDialog.salle?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
