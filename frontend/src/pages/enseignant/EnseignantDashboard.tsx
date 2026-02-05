import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  FileText,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { ROLE_MEMBRE_JURY_LABELS, type Soutenance } from "@/types/models";
import soutenanceService from "@/services/soutenanceService";
import dossierService from "@/services/dossierService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function findMyRole(soutenance: Soutenance, userId: string) {
  const membre = soutenance.jury?.composition?.find(
    (m) => m.enseignant.user.id === userId
  );
  return membre?.role;
}

export default function EnseignantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: soutenances = [], isLoading: isLoadingSout } = useQuery({
    queryKey: ["mesSoutenances"],
    queryFn: () => soutenanceService.getMesSoutenances(),
  });

  const { data: dossiers = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ["mesDossiers"],
    queryFn: () => dossierService.getAll(),
  });

  if (isLoadingSout || isLoadingDossiers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const soutenancesAVenir = soutenances.filter(
    (s) => s.statut === "PLANIFIEE" || s.statut === "EN_COURS"
  );
  const prochaine = soutenancesAVenir
    .filter((s) => s.date_heure)
    .sort(
      (a, b) =>
        new Date(a.date_heure!).getTime() - new Date(b.date_heure!).getTime()
    )[0];

  const nbMemoiresAConsulter = dossiers.filter(
    (d) => d.statut === "DEPOSE" || d.statut === "VALIDE"
  ).length;

  const role = prochaine && user ? findMyRole(prochaine, user.id) : undefined;

  return (
    <div className="max-w-4xl space-y-8">
      {/* En-tête minimaliste */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Bonjour, {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-sm">
          Voici un aperçu de vos activités
        </p>
      </div>

      {/* Stats sous forme de liste simple */}
      <div className="grid gap-px bg-border rounded-lg overflow-hidden border">
        <div
          className="flex items-center justify-between p-4 bg-background cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/mes-candidats")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Étudiants encadrés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {dossiers.length}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>

        <div
          className="flex items-center justify-between p-4 bg-background cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/mes-soutenances")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Soutenances à venir</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {soutenancesAVenir.length}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>

        <div
          className="flex items-center justify-between p-4 bg-background cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/memoires")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium">Mémoires à consulter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {nbMemoiresAConsulter}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Prochaine soutenance */}
      {prochaine && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Prochaine soutenance
          </h2>

          <Card
            className="border hover:border-foreground/20 transition-colors cursor-pointer"
            onClick={() => navigate("/mes-soutenances")}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {prochaine.dossier.candidat.user.first_name}{" "}
                      {prochaine.dossier.candidat.user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {prochaine.dossier.titre_memoire}
                    </p>
                  </div>
                  {role && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {ROLE_MEMBRE_JURY_LABELS[role]}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {prochaine.date_heure && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(prochaine.date_heure), "EEE d MMM", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(prochaine.date_heure), "HH'h'mm")}
                        </span>
                      </div>
                    </>
                  )}
                  {prochaine.salle && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{prochaine.salle.nom}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation rapide */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Accès rapide
        </h2>

        <div className="space-y-1">
          <div
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
            onClick={() => navigate("/mes-candidats")}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Mes étudiants</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
            onClick={() => navigate("/mes-soutenances")}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Mes soutenances</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
            onClick={() => navigate("/memoires")}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Mémoires</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}
