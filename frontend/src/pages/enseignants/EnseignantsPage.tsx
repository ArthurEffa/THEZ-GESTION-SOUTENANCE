import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EnseignantProfile, GRADE_ENSEIGNANT_LABELS } from "@/types/models";
import enseignantService from "@/services/enseignantService";

export default function EnseignantsPage() {
  const navigate = useNavigate();

  // États
  const [enseignants, setEnseignants] = useState<EnseignantProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    enseignant: EnseignantProfile | null
  }>({
    open: false,
    enseignant: null,
  });

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await enseignantService.getAll();
      setEnseignants(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des enseignants:', error);
      toast.error('Erreur lors du chargement des enseignants');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les enseignants
  const filteredEnseignants = enseignants.filter((enseignant) => {
    if (filterGrade !== "all" && enseignant.grade !== filterGrade) {
      return false;
    }
    return true;
  });

  // Colonnes du tableau
  const columns: Column<EnseignantProfile>[] = [
    {
      key: "nom",
      header: "Nom complet",
      render: (enseignant) => (
        <span className="font-medium">
          {enseignant.user.first_name} {enseignant.user.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (enseignant) => (
        <a
          href={`mailto:${enseignant.user.email}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {enseignant.user.email}
        </a>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (enseignant) => (
        <Badge variant="default">{GRADE_ENSEIGNANT_LABELS[enseignant.grade]}</Badge>
      ),
    },
    {
      key: "departements",
      header: "Départements",
      render: (enseignant) => (
        <div className="flex flex-wrap gap-1">
          {enseignant.departements.length > 0 ? (
            enseignant.departements.map((dept) => (
              <Badge key={dept.id} variant="secondary" className="text-xs">
                {dept.code}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">Non assigné</span>
          )}
        </div>
      ),
    },
    {
      key: "telephone",
      header: "Téléphone",
      render: (enseignant) => (
        <span className="text-muted-foreground">
          {enseignant.user.phone || "—"}
        </span>
      ),
    },
  ];

  // Gérer la suppression
  const handleDelete = async () => {
    if (!deleteDialog.enseignant) return;

    try {
      await enseignantService.delete(deleteDialog.enseignant.id);

      // Retirer de la liste locale
      setEnseignants((prev) => prev.filter((e) => e.id !== deleteDialog.enseignant?.id));

      toast.success(
        `Enseignant "${deleteDialog.enseignant.user.first_name} ${deleteDialog.enseignant.user.last_name}" supprimé`
      );
      setDeleteDialog({ open: false, enseignant: null });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'enseignant');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enseignants"
        description={`${enseignants.length} enseignant${enseignants.length > 1 ? 's' : ''} enregistré${enseignants.length > 1 ? 's' : ''}`}
        icon={UserCheck}
        action={{
          label: "Ajouter un enseignant",
          onClick: () => navigate("/enseignants/nouveau"),
        }}
      >
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les grades</SelectItem>
            <SelectItem value="PROFESSEUR">Professeur</SelectItem>
            <SelectItem value="MAITRE_CONF">Maître de Conférence</SelectItem>
            <SelectItem value="CHARGE_COURS">Chargé de Cours</SelectItem>
            <SelectItem value="ASSISTANT">Assistant</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        data={filteredEnseignants}
        columns={columns}
        searchPlaceholder="Rechercher un enseignant..."
        onView={(enseignant) => navigate(`/enseignants/${enseignant.id}`)}
        onEdit={(enseignant) => navigate(`/enseignants/${enseignant.id}/modifier`)}
        onDelete={(enseignant) => setDeleteDialog({ open: true, enseignant })}
        emptyMessage="Aucun enseignant enregistré"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, enseignant: null })}
        title="Supprimer l'enseignant"
        description={
          deleteDialog.enseignant
            ? `Êtes-vous sûr de vouloir supprimer "${deleteDialog.enseignant.user.first_name} ${deleteDialog.enseignant.user.last_name}" ? Cette action supprimera également l'utilisateur associé.`
            : ""
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
