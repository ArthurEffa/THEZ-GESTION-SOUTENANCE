import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FolderOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  ArrowRight 
} from "lucide-react";

type DossierStatus = "brouillon" | "soumis" | "valide";

export default function EtudiantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Données de démonstration
  const [dossierStatus] = useState<DossierStatus>("brouillon");
  const soutenancePlanifiee = true;

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
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/mon-dossier")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Mon dossier</CardTitle>
            <FolderOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {dossierStatus === "brouillon" && (
                  <>
                    <Badge className="bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Brouillon
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complétez et soumettez votre dossier
                    </p>
                  </>
                )}
                {dossierStatus === "soumis" && (
                  <>
                    <Badge className="bg-warning/10 text-warning">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente de validation
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Votre dossier est en cours de révision
                    </p>
                  </>
                )}
                {dossierStatus === "valide" && (
                  <>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Validé
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Votre dossier a été approuvé
                    </p>
                  </>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Statut de la soutenance */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/ma-soutenance")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Ma soutenance</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {soutenancePlanifiee ? (
                  <>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Planifiée
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      15 juin 2024 à 10h00
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
      {soutenancePlanifiee && (
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
                  <p className="font-medium">Samedi 15 juin 2024</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horaire</p>
                  <p className="font-medium">10h00 - 11h30</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Salle</p>
                  <p className="font-medium">Salle A102</p>
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
            Modifier mon dossier
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
