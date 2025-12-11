import { useAuth } from "@/contexts/AuthContext";
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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import dashboardHeroImg from "@/assets/illustrations/filieres-hero.png";
// Demo data
const upcomingSoutenances = [
  {
    id: "1",
    date: "15 Déc 2024",
    heure: "09:00",
    etudiant: "Marie Martin",
    filiere: "Informatique",
    salle: "A101",
    status: "PLANIFIEE" as SoutenanceStatus,
  },
  {
    id: "2",
    date: "15 Déc 2024",
    heure: "10:30",
    etudiant: "Paul Dubois",
    filiere: "Génie Civil",
    salle: "B204",
    status: "PLANIFIEE" as SoutenanceStatus,
  },
  {
    id: "3",
    date: "15 Déc 2024",
    heure: "14:00",
    etudiant: "Sophie Lefebvre",
    filiere: "Informatique",
    salle: "A101",
    status: "PLANIFIEE" as SoutenanceStatus,
  },
  {
    id: "4",
    date: "16 Déc 2024",
    heure: "09:00",
    etudiant: "Lucas Bernard",
    filiere: "Électronique",
    salle: "C302",
    status: "PLANIFIEE" as SoutenanceStatus,
  },
  {
    id: "5",
    date: "16 Déc 2024",
    heure: "11:00",
    etudiant: "Emma Petit",
    filiere: "Mécanique",
    salle: "A101",
    status: "PLANIFIEE" as SoutenanceStatus,
  },
];

const recentActivity = [
  { action: "Nouvelle soutenance planifiée", detail: "Marie Martin - 15 Déc", time: "Il y a 2h" },
  { action: "Jury assigné", detail: "Dr. Dupont → Paul Dubois", time: "Il y a 3h" },
  { action: "Mémoire déposé", detail: "Sophie Lefebvre", time: "Il y a 5h" },
  { action: "Salle modifiée", detail: "B204 → A101", time: "Hier" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          title="Étudiants"
          value="124"
          subtitle="En fin d'études"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Soutenances"
          value="98"
          subtitle="Total planifiées"
          icon={Calendar}
          iconClassName="bg-info/10"
        />
        <StatCard
          title="En attente"
          value="45"
          subtitle="À venir cette semaine"
          icon={Clock}
          iconClassName="bg-warning/10"
        />
        <StatCard
          title="Terminées"
          value="53"
          subtitle="Soutenances validées"
          icon={CheckCircle2}
          iconClassName="bg-success/10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/filieres")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Filières</p>
              <p className="text-xs text-muted-foreground">8 filières</p>
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
              <p className="text-xs text-muted-foreground">12 salles</p>
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
              <p className="text-xs text-muted-foreground">24 membres</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-success transition-colors" />
          </CardContent>
        </Card>
        
        <Card 
          className="card-hover cursor-pointer group"
          onClick={() => navigate("/etudiants")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Étudiants</p>
              <p className="text-xs text-muted-foreground">124 inscrits</p>
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
            <div className="space-y-3">
              {upcomingSoutenances.map((soutenance) => (
                <div
                  key={soutenance.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                      <span className="text-xs text-muted-foreground">
                        {soutenance.date.split(" ")[0]}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {soutenance.date.split(" ")[1]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{soutenance.etudiant}</p>
                      <p className="text-sm text-muted-foreground">
                        {soutenance.heure} • {soutenance.salle} • {soutenance.filiere}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={soutenance.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.detail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
