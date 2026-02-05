import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, MapPin, Clock, Users, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMaSoutenance } from "@/hooks/me-hooks";
import { STATUT_SOUTENANCE_LABELS, ROLE_MEMBRE_JURY_LABELS } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MaSoutenancePage() {
  const { user } = useAuth();
  const { data: soutenance, isLoading } = useGetMaSoutenance();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!soutenance || !soutenance.date_heure) {
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

  const dateHeure = new Date(soutenance.date_heure);
  const membres = soutenance.jury?.composition || [];
  const encadreur = soutenance.dossier?.encadreur;

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
                  {format(dateHeure, "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">Date de la soutenance</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {format(dateHeure, "HH'h'mm", { locale: fr })}
                  {" — "}
                  {soutenance.duree_minutes} min
                </p>
                <p className="text-sm text-muted-foreground">Horaire</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                {soutenance.salle ? (
                  <>
                    <p className="font-medium">{soutenance.salle.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {soutenance.salle.batiment} — Capacité : {soutenance.salle.capacite} places
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Salle non définie</p>
                )}
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
              {membres.length > 0 ? (
                membres.map((membre) => (
                  <div key={membre.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {membre.enseignant.user.first_name} {membre.enseignant.user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ROLE_MEMBRE_JURY_LABELS[membre.role]}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {ROLE_MEMBRE_JURY_LABELS[membre.role]}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Jury non encore assigné</p>
              )}

              {encadreur && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {encadreur.user.first_name} {encadreur.user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">Encadreur</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Encadreur</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
          <CardDescription>Informations de votre soutenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Candidat</p>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className="bg-warning/10 text-warning">
                {STATUT_SOUTENANCE_LABELS[soutenance.statut]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée prévue</p>
              <p className="font-medium">{soutenance.duree_minutes} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membres du jury</p>
              <p className="font-medium">
                {membres.length} membre{membres.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
