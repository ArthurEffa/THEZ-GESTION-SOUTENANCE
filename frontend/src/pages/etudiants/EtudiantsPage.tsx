import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import etudiantsHeroImage from "@/assets/illustrations/etudiants-hero.png";
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

interface Etudiant {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  filiere: string;
  annee: string;
}

// Demo data
const demoEtudiants: Etudiant[] = [
  { id: "1", matricule: "ET2024001", prenom: "Marie", nom: "Martin", email: "m.martin@etu.fr", telephone: "0612345678", filiere: "Informatique", annee: "2024-2025" },
  { id: "2", matricule: "ET2024002", prenom: "Paul", nom: "Dubois", email: "p.dubois@etu.fr", telephone: "0623456789", filiere: "Génie Civil", annee: "2024-2025" },
  { id: "3", matricule: "ET2024003", prenom: "Sophie", nom: "Lefebvre", email: "s.lefebvre@etu.fr", telephone: "0634567890", filiere: "Informatique", annee: "2024-2025" },
  { id: "4", matricule: "ET2024004", prenom: "Lucas", nom: "Bernard", email: "l.bernard@etu.fr", telephone: "0645678901", filiere: "Électronique", annee: "2024-2025" },
  { id: "5", matricule: "ET2024005", prenom: "Emma", nom: "Petit", email: "e.petit@etu.fr", telephone: "0656789012", filiere: "Mécanique", annee: "2024-2025" },
  { id: "6", matricule: "ET2024006", prenom: "Thomas", nom: "Moreau", email: "t.moreau@etu.fr", telephone: "0667890123", filiere: "Informatique", annee: "2024-2025" },
  { id: "7", matricule: "ET2024007", prenom: "Léa", nom: "Garcia", email: "l.garcia@etu.fr", telephone: "0678901234", filiere: "Télécommunications", annee: "2024-2025" },
  { id: "8", matricule: "ET2023015", prenom: "Hugo", nom: "Roux", email: "h.roux@etu.fr", telephone: "0689012345", filiere: "Informatique", annee: "2023-2024" },
];

const filieres = ["Informatique", "Génie Civil", "Électronique", "Mécanique", "Télécommunications"];

export default function EtudiantsPage() {
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState<Etudiant[]>(demoEtudiants);
  const [filterFiliere, setFilterFiliere] = useState<string>("all");
  const [filterAnnee, setFilterAnnee] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; etudiant: Etudiant | null }>({
    open: false,
    etudiant: null,
  });

  const filteredEtudiants = etudiants.filter((etudiant) => {
    if (filterFiliere !== "all" && etudiant.filiere !== filterFiliere) return false;
    if (filterAnnee !== "all" && etudiant.annee !== filterAnnee) return false;
    return true;
  });

  const columns: Column<Etudiant>[] = [
    {
      key: "matricule",
      header: "Matricule",
      render: (etudiant) => (
        <span className="font-mono text-primary">{etudiant.matricule}</span>
      ),
    },
    {
      key: "nom",
      header: "Nom complet",
      render: (etudiant) => (
        <span className="font-medium">{etudiant.prenom} {etudiant.nom}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (etudiant) => (
        <a href={`mailto:${etudiant.email}`} className="text-primary hover:underline">
          {etudiant.email}
        </a>
      ),
    },
    {
      key: "filiere",
      header: "Filière",
      render: (etudiant) => (
        <Badge variant="secondary">{etudiant.filiere}</Badge>
      ),
    },
    {
      key: "annee",
      header: "Année",
      render: (etudiant) => (
        <span className="text-muted-foreground">{etudiant.annee}</span>
      ),
    },
  ];

  const handleDelete = () => {
    if (deleteDialog.etudiant) {
      setEtudiants((prev) => prev.filter((e) => e.id !== deleteDialog.etudiant?.id));
      toast.success(`Étudiant "${deleteDialog.etudiant.prenom} ${deleteDialog.etudiant.nom}" supprimé`);
      setDeleteDialog({ open: false, etudiant: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Étudiants"
          description="Gérez les étudiants en fin d'études"
          icon={Users}
          action={{
            label: "Ajouter un étudiant",
            onClick: () => navigate("/etudiants/nouveau"),
          }}
        >
          <Select value={filterFiliere} onValueChange={setFilterFiliere}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par filière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les filières</SelectItem>
              {filieres.map((filiere) => (
                <SelectItem key={filiere} value={filiere}>
                  {filiere}
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
          src={etudiantsHeroImage} 
          alt="Illustration gestion des candidats" 
          className="hidden lg:block w-48 opacity-90"
        />
      </div>

      <DataTable
        data={filteredEtudiants}
        columns={columns}
        searchPlaceholder="Rechercher un étudiant..."
        onView={(etudiant) => navigate(`/etudiants/${etudiant.id}`)}
        onEdit={(etudiant) => navigate(`/etudiants/${etudiant.id}/modifier`)}
        onDelete={(etudiant) => setDeleteDialog({ open: true, etudiant })}
        emptyMessage="Aucun étudiant enregistré"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, etudiant: null })}
        title="Supprimer l'étudiant"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.etudiant?.prenom} ${deleteDialog.etudiant?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
