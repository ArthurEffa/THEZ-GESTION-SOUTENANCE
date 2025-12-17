import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import candidatsHeroImage from "@/assets/illustrations/etudiants-hero.png";
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
import { CandidatProfile, CYCLE_LABELS } from "@/types/models";
import candidatService from "@/services/candidatService";
import departementService from "@/services/departementService";

export default function CandidatsPage() {
  const navigate = useNavigate();

  // États
  const [candidats, setCandidats] = useState<CandidatProfile[]>([]);
  const [departements, setDepartements] = useState<{ id: string; nom: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartement, setFilterDepartement] = useState<string>("all");
  const [filterCycle, setFilterCycle] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    candidat: CandidatProfile | null
  }>({
    open: false,
    candidat: null,
  });

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger candidats et départements en parallèle
      const [candidatsData, departementsData] = await Promise.all([
        candidatService.getAll(),
        departementService.getAll(),
      ]);

      setCandidats(candidatsData);
      setDepartements(departementsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des candidats');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les candidats
  const filteredCandidats = candidats.filter((candidat) => {
    if (filterDepartement !== "all" && candidat.departement?.id !== filterDepartement) {
      return false;
    }
    if (filterCycle !== "all" && candidat.cycle !== filterCycle) {
      return false;
    }
    return true;
  });

  // Colonnes du tableau
  const columns: Column<CandidatProfile>[] = [
    {
      key: "matricule",
      header: "Matricule",
      render: (candidat) => (
        <span className="font-mono text-primary">{candidat.matricule}</span>
      ),
    },
    {
      key: "nom",
      header: "Nom complet",
      render: (candidat) => (
        <span className="font-medium">
          {candidat.user.first_name} {candidat.user.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (candidat) => (
        <a
          href={`mailto:${candidat.user.email}`}
          className="text-primary hover:underline"
        >
          {candidat.user.email}
        </a>
      ),
    },
    {
      key: "cycle",
      header: "Cycle",
      render: (candidat) => (
        <Badge variant="outline">{CYCLE_LABELS[candidat.cycle]}</Badge>
      ),
    },
    {
      key: "departement",
      header: "Département",
      render: (candidat) => (
        <Badge variant="secondary">
          {candidat.departement ? candidat.departement.nom : "Non assigné"}
        </Badge>
      ),
    },
  ];

  // Gérer la suppression
  const handleDelete = async () => {
    if (!deleteDialog.candidat) return;

    try {
      await candidatService.delete(deleteDialog.candidat.id);

      // Retirer de la liste locale
      setCandidats((prev) => prev.filter((c) => c.id !== deleteDialog.candidat?.id));

      toast.success(
        `Candidat "${deleteDialog.candidat.user.first_name} ${deleteDialog.candidat.user.last_name}" supprimé`
      );
      setDeleteDialog({ open: false, candidat: null });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du candidat');
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="Candidats"
          description={`${candidats.length} candidat${candidats.length > 1 ? 's' : ''} enregistré${candidats.length > 1 ? 's' : ''}`}
          icon={Users}
          action={{
            label: "Ajouter un candidat",
            onClick: () => navigate("/candidats/nouveau"),
          }}
        >
          {/* Filtre par département */}
          <Select value={filterDepartement} onValueChange={setFilterDepartement}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departements.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre par cycle */}
          <Select value={filterCycle} onValueChange={setFilterCycle}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cycles</SelectItem>
              <SelectItem value="INGENIEUR">Ingénieur</SelectItem>
              <SelectItem value="SCIENCE_INGENIEUR">Science de l'ingénieur</SelectItem>
              <SelectItem value="MASTER_PRO">Master professionnel</SelectItem>
            </SelectContent>
          </Select>
        </PageHeader>

        <img
          src={candidatsHeroImage}
          alt="Illustration gestion des candidats"
          className="hidden lg:block w-48 opacity-90"
        />
      </div>

      <DataTable
        data={filteredCandidats}
        columns={columns}
        searchPlaceholder="Rechercher un candidat..."
        onView={(candidat) => navigate(`/candidats/${candidat.id}`)}
        onEdit={(candidat) => navigate(`/candidats/${candidat.id}/modifier`)}
        onDelete={(candidat) => setDeleteDialog({ open: true, candidat })}
        emptyMessage="Aucun candidat enregistré"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, candidat: null })}
        title="Supprimer le candidat"
        description={
          deleteDialog.candidat
            ? `Êtes-vous sûr de vouloir supprimer "${deleteDialog.candidat.user.first_name} ${deleteDialog.candidat.user.last_name}" ? Cette action supprimera également l'utilisateur associé.`
            : ""
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
