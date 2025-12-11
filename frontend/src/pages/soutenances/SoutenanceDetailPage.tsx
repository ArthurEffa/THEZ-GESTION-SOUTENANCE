import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, MapPin, Clock, User, Users, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, SoutenanceStatus } from "@/components/common/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const soutenanceData = {
  id: "1",
  titre: "Développement d'une application IoT pour la surveillance environnementale",
  status: "PLANIFIEE" as SoutenanceStatus,
  etudiant: {
    nom: "Marie Martin",
    matricule: "ET2024001",
    filiere: "Génie Informatique & Télécommunications",
    email: "m.martin@etu.fr",
  },
  date: "15 Décembre 2024",
  heureDebut: "09:00",
  heureFin: "10:00",
  duree: 60,
  salle: {
    nom: "A101",
    batiment: "Bâtiment A",
    capacite: 50,
  },
  jury: {
    president: {
      nom: "Jean Dupont",
      specialite: "Intelligence Artificielle",
      email: "j.dupont@ecole.fr",
    },
    membres: [
      { nom: "Marie Martin", specialite: "Réseaux" },
      { nom: "Sophie Lefebvre", specialite: "Base de données" },
    ],
  },
  observations: "L'étudiant a choisi de présenter son projet en utilisant des démonstrations en direct. Prévoir un accès à Internet.",
};

export default function SoutenanceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    toast.success("Soutenance supprimée avec succès");
    navigate("/soutenances");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/soutenances")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Détail de la soutenance</h1>
              <StatusBadge status={soutenanceData.status} />
            </div>
            <p className="text-muted-foreground max-w-xl">{soutenanceData.titre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/soutenances/${id}/modifier`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Étudiant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{soutenanceData.etudiant.nom}</span>
                <Badge variant="secondary">{soutenanceData.etudiant.filiere}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Matricule: <span className="font-mono">{soutenanceData.etudiant.matricule}</span></p>
                <p>Email: <a href={`mailto:${soutenanceData.etudiant.email}`} className="text-primary hover:underline">{soutenanceData.etudiant.email}</a></p>
              </div>
            </CardContent>
          </Card>

          {/* Jury */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Jury
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{soutenanceData.jury.president.nom}</span>
                  <Badge>Président</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {soutenanceData.jury.president.specialite}
                </p>
                <p className="text-sm text-muted-foreground">
                  {soutenanceData.jury.president.email}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Membres du jury</p>
                {soutenanceData.jury.membres.map((membre, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <span className="font-medium">{membre.nom}</span>
                    <span className="text-sm text-muted-foreground">{membre.specialite}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {soutenanceData.observations && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{soutenanceData.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Planning */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                  <span className="text-xs text-muted-foreground">
                    {soutenanceData.date.split(" ")[0]}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {soutenanceData.date.split(" ")[1]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{soutenanceData.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {soutenanceData.heureDebut} - {soutenanceData.heureFin}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Durée: {soutenanceData.duree} minutes
              </div>
            </CardContent>
          </Card>

          {/* Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Salle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-medium">{soutenanceData.salle.nom}</p>
              <p className="text-sm text-muted-foreground">{soutenanceData.salle.batiment}</p>
              <p className="text-sm text-muted-foreground">
                Capacité: {soutenanceData.salle.capacite} places
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la soutenance"
        description="Êtes-vous sûr de vouloir supprimer cette soutenance ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
