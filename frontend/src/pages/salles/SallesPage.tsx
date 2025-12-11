import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, X } from "lucide-react";
import sallesHeroImage from "@/assets/illustrations/salles-hero.png";
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

interface Salle {
  id: string;
  nom: string;
  batiment: string;
  capacite: number;
  equipements: string;
  disponible: boolean;
}

// Demo data
const demoSalles: Salle[] = [
  { id: "1", nom: "A101", batiment: "Bâtiment A", capacite: 50, equipements: "Vidéoprojecteur, Tableau blanc", disponible: true },
  { id: "2", nom: "A102", batiment: "Bâtiment A", capacite: 30, equipements: "Vidéoprojecteur", disponible: true },
  { id: "3", nom: "B204", batiment: "Bâtiment B", capacite: 40, equipements: "Vidéoprojecteur, Système audio", disponible: false },
  { id: "4", nom: "B205", batiment: "Bâtiment B", capacite: 35, equipements: "Tableau interactif", disponible: true },
  { id: "5", nom: "C302", batiment: "Bâtiment C", capacite: 60, equipements: "Vidéoprojecteur, Système visioconférence", disponible: true },
  { id: "6", nom: "C303", batiment: "Bâtiment C", capacite: 25, equipements: "Vidéoprojecteur", disponible: false },
  { id: "7", nom: "D401", batiment: "Bâtiment D", capacite: 80, equipements: "Amphithéâtre équipé", disponible: true },
  { id: "8", nom: "D402", batiment: "Bâtiment D", capacite: 45, equipements: "Vidéoprojecteur, Climatisation", disponible: true },
];

export default function SallesPage() {
  const navigate = useNavigate();
  const [salles, setSalles] = useState<Salle[]>(demoSalles);
  const [filterDisponible, setFilterDisponible] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; salle: Salle | null }>({
    open: false,
    salle: null,
  });

  const filteredSalles = salles.filter((salle) => {
    if (filterDisponible === "all") return true;
    return filterDisponible === "disponible" ? salle.disponible : !salle.disponible;
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
    },
    {
      key: "capacite",
      header: "Capacité",
      render: (salle) => (
        <span className="text-muted-foreground">{salle.capacite} places</span>
      ),
    },
    {
      key: "equipements",
      header: "Équipements",
      render: (salle) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {salle.equipements}
        </span>
      ),
    },
    {
      key: "disponible",
      header: "Disponibilité",
      render: (salle) => (
        <Badge variant={salle.disponible ? "default" : "secondary"} className="gap-1">
          {salle.disponible ? (
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
      setSalles((prev) => prev.filter((s) => s.id !== deleteDialog.salle?.id));
      toast.success(`Salle "${deleteDialog.salle.nom}" supprimée`);
      setDeleteDialog({ open: false, salle: null });
    }
  };

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
