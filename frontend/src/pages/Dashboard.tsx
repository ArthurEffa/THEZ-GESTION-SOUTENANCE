import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, SoutenanceStatus } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Building2,
  UserCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import candidatService from "@/services/candidatService";
import soutenanceService from "@/services/soutenanceService";
import departementService from "@/services/departementService";
import salleService from "@/services/salleService";
import juryService from "@/services/juryService";
import dashboardHeroImg from "@/assets/illustrations/filieres-hero.png";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: candidats = [], isLoading: l1 } = useQuery({
    queryKey: ["candidats"],
    queryFn: () => candidatService.getAll(),
  });

  const { data: soutenances = [], isLoading: l2 } = useQuery({
    queryKey: ["soutenances"],
    queryFn: () => soutenanceService.getAll(),
  });

  const { data: departements = [], isLoading: l3 } = useQuery({
    queryKey: ["departements"],
    queryFn: () => departementService.getAll(),
  });

  const { data: salles = [], isLoading: l4 } = useQuery({
    queryKey: ["salles"],
    queryFn: () => salleService.getAll(),
  });

  const { data: jurys = [], isLoading: l5 } = useQuery({
    queryKey: ["jurys"],
    queryFn: () => juryService.getAll(),
  });

  const isLoading = l1 || l2 || l3 || l4 || l5;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Stats calculées
  const nbCandidats = candidats.length;
  const nbSoutenances = soutenances.length;
  const soutenancesPlanifiees = soutenances.filter(
    (s) => s.statut === "PLANIFIEE"
  );
  const soutenancesTerminees = soutenances.filter(
    (s) => s.statut === "TERMINEE"
  );

  // Prochaines soutenances (planifiées, triées par date)
  const upcoming = soutenancesPlanifiees
    .filter((s) => s.date_heure)
    .sort(
      (a, b) =>
        new Date(a.date_heure!).getTime() - new Date(b.date_heure!).getTime()
    )
    .slice(0, 5);

  // Soutenances récentes (terminées les plus récentes)
  const recentCompleted = soutenancesTerminees
    .filter((s) => s.date_heure)
    .sort(
      (a, b) =>
        new Date(b.date_heure!).getTime() - new Date(a.date_heure!).getTime()
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Header with Illustration */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de vos soutenances et activités récentes.
          </p>
        </div>
        <div className="hidden lg:flex items-center justify-center w-40 h-40 overflow-hidden">
          <img
            src={dashboardHeroImg}
            alt="Gestion des soutenances"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Candidats"
          value={nbCandidats}
          subtitle="Enregistrés"
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Soutenances"
          value={nbSoutenances}
          subtitle="Total créées"
          icon={Calendar}
          iconBg="bg-info/10"
          iconColor="text-info"
        />
        <StatCard
          title="Planifiées"
          value={soutenancesPlanifiees.length}
          subtitle="À venir"
          icon={Clock}
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          title="Terminées"
          value={soutenancesTerminees.length}
          subtitle="Soutenances validées"
          icon={CheckCircle2}
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/departements")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Départements</p>
              <p className="text-xs text-muted-foreground">
                {departements.length} département{departements.length > 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>

        <Card
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/salles")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 group-hover:bg-info group-hover:text-info-foreground transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Salles</p>
              <p className="text-xs text-muted-foreground">
                {salles.length} salle{salles.length > 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-info transition-colors" />
          </CardContent>
        </Card>

        <Card
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/jurys")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success group-hover:text-success-foreground transition-colors">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Jurys</p>
              <p className="text-xs text-muted-foreground">
                {jurys.length} jury{jurys.length > 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-success transition-colors" />
          </CardContent>
        </Card>

        <Card
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/candidats")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Candidats</p>
              <p className="text-xs text-muted-foreground">
                {nbCandidats} inscrit{nbCandidats > 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-warning transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Soutenances */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              Prochaines soutenances
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate("/soutenances")}
            >
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune soutenance planifiée à venir
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((soutenance) => {
                  const dateHeure = new Date(soutenance.date_heure!);
                  return (
                    <div
                      key={soutenance.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/soutenances/${soutenance.id}`)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                          <span className="text-xs text-muted-foreground">
                            {format(dateHeure, "dd")}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {format(dateHeure, "MMM", { locale: fr })}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {soutenance.dossier.candidat.user.first_name}{" "}
                            {soutenance.dossier.candidat.user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(dateHeure, "HH'h'mm")}
                            {soutenance.salle && ` \u2022 ${soutenance.salle.nom}`}
                            {soutenance.dossier.candidat.departement &&
                              ` \u2022 ${soutenance.dossier.candidat.departement.nom}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={soutenance.statut as SoutenanceStatus}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity - soutenances terminées récemment */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Dernières terminées
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompleted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune soutenance terminée
              </p>
            ) : (
              <div className="space-y-4">
                {recentCompleted.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/soutenances/${s.id}`)}
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-success" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {s.dossier.candidat.user.first_name}{" "}
                        {s.dossier.candidat.user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {s.dossier.titre_memoire}
                      </p>
                      {s.date_heure && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(s.date_heure), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
