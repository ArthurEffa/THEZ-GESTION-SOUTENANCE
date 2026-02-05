import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, FileText, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getDepartmentColor } from "@/config/departments";
import {
  ROLE_MEMBRE_JURY_LABELS,
  STATUT_SOUTENANCE_LABELS,
  type RoleMembreJury,
  type Soutenance,
} from "@/types/models";
import soutenanceService from "@/services/soutenanceService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string }> = {
  PLANIFIEE: { label: "Planifiée", color: "bg-blue-100 text-blue-700" },
  EN_COURS: { label: "En cours", color: "bg-amber-100 text-amber-700" },
  TERMINEE: { label: "Terminée", color: "bg-emerald-100 text-emerald-700" },
  ANNULEE: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

function findMyRole(soutenance: Soutenance, userId: string): RoleMembreJury | undefined {
  return soutenance.jury?.composition?.find(
    (m) => m.enseignant.user.id === userId
  )?.role;
}

export default function MesSoutenancesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterRole, setFilterRole] = useState<string>("all");

  const { data: soutenances = [], isLoading } = useQuery({
    queryKey: ["mesSoutenances"],
    queryFn: () => soutenanceService.getMesSoutenances(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Enrichir chaque soutenance avec le rôle de l'enseignant connecté
  const enriched = soutenances.map((s) => ({
    ...s,
    myRole: user ? findMyRole(s, user.id) : undefined,
    departement: s.dossier?.candidat?.departement?.nom || "",
  }));

  // Filtrage
  const filtered = enriched.filter((s) => {
    if (filterRole !== "all" && s.myRole !== filterRole) return false;
    return true;
  });

  const soutenancesAVenir = filtered.filter(
    (s) => s.statut === "PLANIFIEE" || s.statut === "EN_COURS"
  );
  const soutenancesPassees = filtered.filter(
    (s) => s.statut === "TERMINEE" || s.statut === "ANNULEE"
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* En-tête */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Mes soutenances
        </h1>
        <p className="text-muted-foreground text-sm">
          Soutenances où vous êtes membre du jury
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {(Object.keys(ROLE_MEMBRE_JURY_LABELS) as RoleMembreJury[]).map(
              (role) => (
                <SelectItem key={role} value={role} className="text-xs">
                  {ROLE_MEMBRE_JURY_LABELS[role]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Soutenances à venir */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          À venir ({soutenancesAVenir.length})
        </h2>

        {soutenancesAVenir.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            Aucune soutenance à venir
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {soutenancesAVenir.map((soutenance) => {
              const deptColor = getDepartmentColor(soutenance.departement);
              return (
                <div
                  key={soutenance.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() =>
                    navigate(`/soutenances/${soutenance.id}`)
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {soutenance.dossier.candidat.user.first_name}{" "}
                          {soutenance.dossier.candidat.user.last_name}
                        </span>
                        {soutenance.myRole && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {ROLE_MEMBRE_JURY_LABELS[soutenance.myRole]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {soutenance.dossier.titre_memoire}
                      </p>
                      {soutenance.departement && (
                        <span className={`text-[10px] ${deptColor.text}`}>
                          {soutenance.departement}
                        </span>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        {soutenance.date_heure && (
                          <>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(soutenance.date_heure),
                                  "EEE d MMM",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(soutenance.date_heure),
                                  "HH'h'mm"
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        {soutenance.salle && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{soutenance.salle.nom}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileText className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Soutenances passées */}
      {soutenancesPassees.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Passées ({soutenancesPassees.length})
          </h2>

          <div className="border rounded-lg divide-y">
            {soutenancesPassees.map((soutenance) => {
              const status = statusConfig[soutenance.statut];
              const deptColor = getDepartmentColor(soutenance.departement);
              return (
                <div
                  key={soutenance.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer opacity-60 hover:opacity-100"
                  onClick={() =>
                    navigate(`/soutenances/${soutenance.id}`)
                  }
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {soutenance.dossier.candidat.user.first_name}{" "}
                        {soutenance.dossier.candidat.user.last_name}
                      </span>
                      <Badge
                        className={`text-[10px] font-normal ${status.color}`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {soutenance.dossier.titre_memoire}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {soutenance.date_heure && (
                        <span>
                          {format(
                            new Date(soutenance.date_heure),
                            "dd/MM/yyyy",
                            { locale: fr }
                          )}
                        </span>
                      )}
                      {soutenance.departement && (
                        <span className={deptColor.text}>
                          {soutenance.departement}
                        </span>
                      )}
                      {soutenance.myRole && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {ROLE_MEMBRE_JURY_LABELS[soutenance.myRole]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
