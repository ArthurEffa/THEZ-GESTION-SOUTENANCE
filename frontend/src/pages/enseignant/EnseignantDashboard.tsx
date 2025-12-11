import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  FileText, 
  Clock, 
  MapPin, 
  Users,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { ROLE_MEMBRE_JURY_LABELS, type RoleMembreJury } from "@/types/models";

// Données de démonstration
const prochaineSoutenance = {
  etudiant: { nom: "Martin", prenom: "Pierre" },
  titre: "Développement d'une application mobile de suivi sportif",
  date: "2024-06-15",
  heureDebut: "10:00",
  salle: "Salle A102",
  role: "PRESIDENT" as RoleMembreJury,
};

const stats = {
  etudiantsEncadres: 2,
  soutenancesAVenir: 4,
  memoiresAConsulter: 2,
};

export default function EnseignantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          onClick={() => navigate("/mes-etudiants")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Étudiants encadrés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{stats.etudiantsEncadres}</span>
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
            <span className="text-sm text-muted-foreground">{stats.soutenancesAVenir}</span>
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
            <span className="text-sm text-muted-foreground">{stats.memoiresAConsulter}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Prochaine soutenance */}
      {prochaineSoutenance && (
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
                      {prochaineSoutenance.etudiant.prenom} {prochaineSoutenance.etudiant.nom}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {prochaineSoutenance.titre}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {ROLE_MEMBRE_JURY_LABELS[prochaineSoutenance.role]}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(prochaineSoutenance.date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{prochaineSoutenance.heureDebut}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{prochaineSoutenance.salle}</span>
                  </div>
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
            onClick={() => navigate("/mes-etudiants")}
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
