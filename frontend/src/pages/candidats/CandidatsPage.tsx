import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
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

interface Candidat {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  departement: string;
  annee: string;
}

// Demo data
const demoCandidats: Candidat[] = [
  { id: "1", matricule: "ET2024001", prenom: "Marie", nom: "Martin", email: "m.martin@etu.fr", telephone: "0612345678", departement: "Informatique", annee: "2024-2025" },
  { id: "2", matricule: "ET2024002", prenom: "Paul", nom: "Dubois", email: "p.dubois@etu.fr", telephone: "0623456789", departement: "Génie Civil", annee: "2024-2025" },
  { id: "3", matricule: "ET2024003", prenom: "Sophie", nom: "Lefebvre", email: "s.lefebvre@etu.fr", telephone: "0634567890", departement: "Informatique", annee: "2024-2025" },
  { id: "4", matricule: "ET2024004", prenom: "Lucas", nom: "Bernard", email: "l.bernard@etu.fr", telephone: "0645678901", departement: "Électronique", annee: "2024-2025" },
  { id: "5", matricule: "ET2024005", prenom: "Emma", nom: "Petit", email: "e.petit@etu.fr", telephone: "0656789012", departement: "Mécanique", annee: "2024-2025" },
  { id: "6", matricule: "ET2024006", prenom: "Thomas", nom: "Moreau", email: "t.moreau@etu.fr", telephone: "0667890123", departement: "Informatique", annee: "2024-2025" },
  { id: "7", matricule: "ET2024007", prenom: "Léa", nom: "Garcia", email: "l.garcia@etu.fr", telephone: "0678901234", departement: "Télécommunications", annee: "2024-2025" },
  { id: "8", matricule: "ET2023015", prenom: "Hugo", nom: "Roux", email: "h.roux@etu.fr", telephone: "0689012345", departement: "Informatique", annee: "2023-2024" },
];

const departements = ["Informatique", "Génie Civil", "Électronique", "Mécanique", "Télécommunications"];

export default function CandidatsPage() {
  const navigate = useNavigate();
  const [candidats, setCandidats] = useState<Candidat[]>(demoCandidats);
  const [filterDepartement, setFilterDepartement] = useState<string>("all");
  const [filterAnnee, setFilterAnnee] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; candidat: Candidat | null }>({
    open: false,
    candidat: null,
  });

  const filteredCandidats = candidats.filter((candidat) => {
    if (filterDepartement !== "all" && candidat.departement !== filterDepartement) return false;
    if (filterAnnee !== "all" && candidat.annee !== filterAnnee) return false;
    return true;
  });

  const columns: Column<Candidat>[] = [
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
        <span className="font-medium">{candidat.prenom} {candidat.nom}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (candidat) => (
        <a href={`mailto:${candidat.email}`} className="text-primary hover:underline">
          {candidat.email}
        </a>
      ),
    },
    {
      key: "departement",
      header: "Département",
      render: (candidat) => (
        <Badge variant="secondary">{candidat.departement}</Badge>
      ),
    },
    {
      key: "annee",
      header: "Année",
      render: (candidat) => (
        <span className="text-muted-foreground">{candidat.annee}</span>
      ),
    },
  ];

  const handleDelete = () => {
    if (deleteDialog.candidat) {
      setCandidats((prev) => prev.filter((e) => e.id !== deleteDialog.candidat?.id));
      toast.success(`Candidat "${deleteDialog.candidat.prenom} ${deleteDialog.candidat.nom}" supprimé`);
      setDeleteDialog({ open: false, candidat: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Candidats"
          description="Gérez les candidats en fin d'études"
          icon={Users}
          action={{
            label: "Ajouter un candidat",
            onClick: () => navigate("/candidats/nouveau"),
          }}
        >
          <Select value={filterDepartement} onValueChange={setFilterDepartement}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departements.map((departement) => (
                <SelectItem key={departement} value={departement}>
                  {departement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAnnee} onValueChange={setFilterAnnee}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
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
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.candidat?.prenom} ${deleteDialog.candidat?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
