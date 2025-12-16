import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, MapPin, Clock, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Données de démonstration - à remplacer par les vraies données
const maSoutenance = {
  hasAssignment: true, // Passer à false pour simuler "pas encore planifié"
  date: "2024-06-15",
  heureDebut: "10:00",
  heureFin: "11:30",
  salle: {
    nom: "Salle A102",
    batiment: "Bâtiment A",
    capacite: 30,
  },
  jury: [
    { nom: "Dr. Martin", prenom: "Jean", role: "Président" },
    { nom: "Dr. Dubois", prenom: "Marie", role: "Rapporteur" },
    { nom: "Pr. Bernard", prenom: "Pierre", role: "Examinateur" },
  ],
  encadreur: { nom: "Dr. Lefebvre", prenom: "Sophie" },
  status: "PLANIFIEE" as const,
};

export default function MaSoutenancePage() {
  const { user } = useAuth();

  if (!maSoutenance.hasAssignment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ma soutenance"
          description="Suivez les détails de votre soutenance"
          icon={ClipboardList}
        />
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune soutenance planifiée</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Votre soutenance n'a pas encore été planifiée par l'administration. 
              Vous recevrez une notification dès qu'elle sera programmée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ma soutenance"
        description="Détails de votre soutenance programmée"
        icon={ClipboardList}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Date et lieu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Date et lieu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {new Date(maSoutenance.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Date de la soutenance</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {maSoutenance.heureDebut} - {maSoutenance.heureFin}
                </p>
                <p className="text-sm text-muted-foreground">Horaire</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{maSoutenance.salle.nom}</p>
                <p className="text-sm text-muted-foreground">
                  {maSoutenance.salle.batiment} • Capacité: {maSoutenance.salle.capacite} places
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jury */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Composition du jury
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maSoutenance.jury.map((membre, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{membre.prenom} {membre.nom}</p>
                    <p className="text-sm text-muted-foreground">{membre.role}</p>
                  </div>
                  <Badge variant="outline">{membre.role}</Badge>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {maSoutenance.encadreur.prenom} {maSoutenance.encadreur.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">Encadreur</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">Encadreur</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations candidat */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
          <CardDescription>Informations de votre soutenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Candidat</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className="bg-warning/10 text-warning">Planifiée</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée prévue</p>
              <p className="font-medium">1h30</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membres du jury</p>
              <p className="font-medium">{maSoutenance.jury.length} membres</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
