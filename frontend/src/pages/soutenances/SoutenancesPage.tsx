import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LayoutGrid, List } from "lucide-react";
import soutenancesHeroImage from "@/assets/illustrations/gestion-soutenances.png";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge, SoutenanceStatus } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SoutenanceCalendar } from "@/components/soutenances/SoutenanceCalendar";

interface Soutenance {
  id: string;
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  etudiant: string;
  filiere: string;
  salle: string;
  jury: string;
  status: SoutenanceStatus;
}

// Demo data avec vrais départements
const demoSoutenances: Soutenance[] = [
  { id: "1", titre: "Développement d'une application IoT", date: "09/12/2024", heureDebut: "09:00", heureFin: "10:00", etudiant: "Marie Martin", filiere: "Génie Informatique & Télécommunications", salle: "A101", jury: "Jean Dupont", status: "PLANIFIEE" },
  { id: "2", titre: "Conception d'un pont suspendu", date: "09/12/2024", heureDebut: "10:30", heureFin: "11:30", etudiant: "Paul Dubois", filiere: "Génie Civil", salle: "B204", jury: "Marie Martin", status: "PLANIFIEE" },
  { id: "3", titre: "Intelligence artificielle pour la santé", date: "10/12/2024", heureDebut: "14:00", heureFin: "15:00", etudiant: "Sophie Lefebvre", filiere: "Génie Informatique & Télécommunications", salle: "A101", jury: "Jean Dupont", status: "EN_COURS" },
  { id: "4", titre: "Systèmes embarqués automobiles", date: "10/12/2024", heureDebut: "09:00", heureFin: "10:00", etudiant: "Lucas Bernard", filiere: "Génie Électrique et Systèmes Intelligents", salle: "C302", jury: "Paul Bernard", status: "PLANIFIEE" },
  { id: "5", titre: "Robotique industrielle", date: "11/12/2024", heureDebut: "11:00", heureFin: "12:00", etudiant: "Emma Petit", filiere: "Génie Mécanique", salle: "A101", jury: "Sophie Lefebvre", status: "PLANIFIEE" },
  { id: "6", titre: "Réseaux 5G et télécommunications", date: "12/12/2024", heureDebut: "09:00", heureFin: "10:00", etudiant: "Léa Garcia", filiere: "Génie Informatique & Télécommunications", salle: "D401", jury: "Marie Martin", status: "PLANIFIEE" },
  { id: "7", titre: "Management de la qualité HSE", date: "13/12/2024", heureDebut: "14:00", heureFin: "15:00", etudiant: "Thomas Moreau", filiere: "Génie de la Qualité HSE Industriel", salle: "A102", jury: "Paul Bernard", status: "PLANIFIEE" },
  { id: "8", titre: "Analyse de données géospatiales", date: "11/12/2024", heureDebut: "09:00", heureFin: "10:00", etudiant: "Claire Roux", filiere: "Génie Civil", salle: "B204", jury: "Jean Dupont", status: "PLANIFIEE" },
];

export default function SoutenancesPage() {
  const navigate = useNavigate();
  const [soutenances, setSoutenances] = useState<Soutenance[]>(demoSoutenances);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; soutenance: Soutenance | null }>({
    open: false,
    soutenance: null,
  });

  const filteredSoutenances = soutenances.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  const columns: Column<Soutenance>[] = [
    {
      key: "date",
      header: "Date",
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-medium">{s.date}</span>
          <span className="text-xs text-muted-foreground">{s.heureDebut} - {s.heureFin}</span>
        </div>
      ),
    },
    {
      key: "etudiant",
      header: "Etudiant",
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-medium">{s.etudiant}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{s.titre}</span>
        </div>
      ),
    },
    {
      key: "filiere",
      header: "Filiere",
      render: (s) => <Badge variant="secondary">{s.filiere}</Badge>,
    },
    {
      key: "salle",
      header: "Salle",
    },
    {
      key: "jury",
      header: "Jury (President)",
      render: (s) => <span className="text-muted-foreground">{s.jury}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  const handleDelete = () => {
    if (deleteDialog.soutenance) {
      setSoutenances((prev) => prev.filter((s) => s.id !== deleteDialog.soutenance?.id));
      toast.success("Soutenance supprimee");
      setDeleteDialog({ open: false, soutenance: null });
    }
  };

  const handleSoutenanceClick = (soutenance: Soutenance) => {
    navigate(`/soutenances/${soutenance.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Soutenances"
          description="Planifiez et gerez les soutenances academiques"
          icon={Calendar}
          action={{
            label: "Planifier une soutenance",
            onClick: () => navigate("/soutenances/nouveau"),
          }}
        >
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border bg-muted p-1">
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("calendar")}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Calendrier
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-1" />
                Liste
              </Button>
            </div>
            
            {viewMode === "list" && (
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PLANIFIEE">Planifiees</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="TERMINEE">Terminees</SelectItem>
                  <SelectItem value="ANNULEE">Annulees</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </PageHeader>
        <img 
          src={soutenancesHeroImage} 
          alt="Illustration gestion des soutenances" 
          className="hidden lg:block w-48 opacity-90"
        />
      </div>

      {viewMode === "calendar" ? (
        <SoutenanceCalendar 
          soutenances={soutenances} 
          onSoutenanceClick={handleSoutenanceClick}
        />
      ) : (
        <DataTable
          data={filteredSoutenances}
          columns={columns}
          searchPlaceholder="Rechercher une soutenance..."
          onView={(s) => navigate(`/soutenances/${s.id}`)}
          onEdit={(s) => navigate(`/soutenances/${s.id}/modifier`)}
          onDelete={(s) => setDeleteDialog({ open: true, soutenance: s })}
          emptyMessage="Aucune soutenance planifiee"
        />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, soutenance: null })}
        title="Supprimer la soutenance"
        description={`Etes-vous sur de vouloir supprimer la soutenance de "${deleteDialog.soutenance?.etudiant}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
