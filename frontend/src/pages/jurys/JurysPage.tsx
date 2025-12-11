import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck } from "lucide-react";
import jurysHeroImage from "@/assets/illustrations/jurys-hero.png";
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

interface Jury {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  specialite: string;
  type: "Professeur" | "Intervenant" | "Docteur";
  etablissement: string;
}

// Demo data
const demoJurys: Jury[] = [
  { id: "1", prenom: "Jean", nom: "Dupont", email: "j.dupont@ecole.fr", telephone: "0612345678", specialite: "Intelligence Artificielle", type: "Professeur", etablissement: "École Polytechnique" },
  { id: "2", prenom: "Marie", nom: "Martin", email: "m.martin@univ.fr", telephone: "0623456789", specialite: "Réseaux et Télécommunications", type: "Docteur", etablissement: "Université Paris-Saclay" },
  { id: "3", prenom: "Paul", nom: "Bernard", email: "p.bernard@tech.com", telephone: "0634567890", specialite: "Cybersécurité", type: "Intervenant", etablissement: "Tech Solutions SA" },
  { id: "4", prenom: "Sophie", nom: "Lefebvre", email: "s.lefebvre@ecole.fr", telephone: "0645678901", specialite: "Base de données", type: "Professeur", etablissement: "École Centrale" },
  { id: "5", prenom: "Pierre", nom: "Moreau", email: "p.moreau@univ.fr", telephone: "0656789012", specialite: "Génie Logiciel", type: "Docteur", etablissement: "Sorbonne Université" },
  { id: "6", prenom: "Claire", nom: "Rousseau", email: "c.rousseau@ecole.fr", telephone: "0667890123", specialite: "Machine Learning", type: "Professeur", etablissement: "ENSAE" },
];

export default function JurysPage() {
  const navigate = useNavigate();
  const [jurys, setJurys] = useState<Jury[]>(demoJurys);
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jury: Jury | null }>({
    open: false,
    jury: null,
  });

  const filteredJurys = jurys.filter((jury) => {
    if (filterType === "all") return true;
    return jury.type === filterType;
  });

  const columns: Column<Jury>[] = [
    {
      key: "nom",
      header: "Nom complet",
      render: (jury) => (
        <span className="font-medium">{jury.prenom} {jury.nom}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (jury) => (
        <a href={`mailto:${jury.email}`} className="text-primary hover:underline">
          {jury.email}
        </a>
      ),
    },
    {
      key: "specialite",
      header: "Spécialité",
    },
    {
      key: "type",
      header: "Type",
      render: (jury) => {
        const variants: Record<string, "default" | "secondary" | "outline"> = {
          Professeur: "default",
          Docteur: "secondary",
          Intervenant: "outline",
        };
        return <Badge variant={variants[jury.type]}>{jury.type}</Badge>;
      },
    },
    {
      key: "etablissement",
      header: "Établissement",
      render: (jury) => (
        <span className="text-muted-foreground">{jury.etablissement}</span>
      ),
    },
  ];

  const handleDelete = () => {
    if (deleteDialog.jury) {
      setJurys((prev) => prev.filter((j) => j.id !== deleteDialog.jury?.id));
      toast.success(`Jury "${deleteDialog.jury.prenom} ${deleteDialog.jury.nom}" supprimé`);
      setDeleteDialog({ open: false, jury: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Jurys"
          description="Gérez les membres du jury de soutenance"
          icon={UserCheck}
          action={{
            label: "Ajouter un jury",
            onClick: () => navigate("/jurys/nouveau"),
          }}
        >
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Professeur">Professeurs</SelectItem>
              <SelectItem value="Docteur">Docteurs</SelectItem>
              <SelectItem value="Intervenant">Intervenants</SelectItem>
            </SelectContent>
          </Select>
        </PageHeader>
        <img 
          src={jurysHeroImage} 
          alt="Illustration gestion des jurys" 
          className="hidden lg:block w-48 opacity-90"
        />
      </div>

      <DataTable
        data={filteredJurys}
        columns={columns}
        searchPlaceholder="Rechercher un jury..."
        onView={(jury) => navigate(`/jurys/${jury.id}`)}
        onEdit={(jury) => navigate(`/jurys/${jury.id}/modifier`)}
        onDelete={(jury) => setDeleteDialog({ open: true, jury })}
        emptyMessage="Aucun jury enregistré"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, jury: null })}
        title="Supprimer le jury"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.jury?.prenom} ${deleteDialog.jury?.nom}" de la liste des jurys ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
