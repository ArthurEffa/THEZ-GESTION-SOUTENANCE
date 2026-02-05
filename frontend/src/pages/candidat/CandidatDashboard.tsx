import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGetMonDossier, useGetMaSoutenance } from "@/hooks/me-hooks";
import { STATUT_DOSSIER_LABELS, STATUT_SOUTENANCE_LABELS } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FolderOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  FolderPlus,
} from "lucide-react";

export default function CandidatDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dossier, isLoading: isLoadingDossier } = useGetMonDossier();
  const { data: soutenance, isLoading: isLoadingSoutenance } = useGetMaSoutenance();

  const isLoading = isLoadingDossier || isLoadingSoutenance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const dossierStatus = dossier?.statut;
  const hasSoutenance = !!soutenance?.date_heure;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenue, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          Gérez votre dossier de soutenance et suivez votre planning
        </p>
      </div>

      {/* Cartes d'action rapide */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Statut du dossier */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/mon-dossier")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Mon dossier</CardTitle>
            <FolderOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {!dossier ? (
                  <>
                    <Badge className="bg-muted text-muted-foreground">
                      <FolderPlus className="h-3 w-3 mr-1" />
                      Aucun dossier
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Créez votre dossier pour commencer
                    </p>
                  </>
                ) : dossierStatus === "BROUILLON" ? (
                  <>
                    <Badge className="bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Brouillon
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complétez et soumettez votre dossier
                    </p>
                  </>
                ) : dossierStatus === "DEPOSE" ? (
                  <>
                    <Badge className="bg-warning/10 text-warning">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente de validation
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Votre dossier est en cours de révision
                    </p>
                  </>
                ) : dossierStatus === "VALIDE" ? (
                  <>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Validé
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Votre dossier a été approuvé
                    </p>
                  </>
                ) : dossierStatus === "REJETE" ? (
                  <>
                    <Badge className="bg-destructive/10 text-destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Rejeté
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {dossier.commentaires_admin || "Veuillez corriger votre dossier"}
                    </p>
                  </>
                ) : null}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Statut de la soutenance */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/ma-soutenance")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Ma soutenance</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {hasSoutenance ? (
                  <>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {STATUT_SOUTENANCE_LABELS[soutenance!.statut]}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {format(new Date(soutenance!.date_heure!), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </p>
                  </>
                ) : (
                  <>
                    <Badge className="bg-muted text-muted-foreground">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Non planifiée
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      En attente de planification
                    </p>
                  </>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails de la soutenance si planifiée */}
      {hasSoutenance && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de votre soutenance</CardTitle>
            <CardDescription>
              Informations sur votre soutenance programmée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(soutenance!.date_heure!), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horaire</p>
                  <p className="font-medium">
                    {format(new Date(soutenance!.date_heure!), "HH'h'mm", { locale: fr })}
                    {" — "}
                    {soutenance!.duree_minutes} min
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Salle</p>
                  <p className="font-medium">
                    {soutenance!.salle ? `${soutenance!.salle.nom} — ${soutenance!.salle.batiment}` : "Non définie"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="outline" onClick={() => navigate("/ma-soutenance")}>
                  Voir les détails
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/mon-dossier")}>
            <FolderOpen className="h-4 w-4 mr-2" />
            {dossier ? "Voir mon dossier" : "Créer mon dossier"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/ma-soutenance")}>
            <Calendar className="h-4 w-4 mr-2" />
            Voir ma soutenance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
