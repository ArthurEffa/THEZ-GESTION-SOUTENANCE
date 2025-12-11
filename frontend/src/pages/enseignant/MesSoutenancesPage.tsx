import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDepartmentColor } from "@/config/departments";
import { ROLE_MEMBRE_JURY_LABELS, type RoleMembreJury } from "@/types/models";

// Données de démonstration
const soutenances = [
  {
    id: "1",
    etudiant: { nom: "Martin", prenom: "Pierre" },
    titre: "Développement d'une application mobile de suivi sportif",
    departement: "Génie Informatique & Télécommunications",
    date: "2024-06-15",
    heureDebut: "10:00",
    salle: "Salle A102",
    roleJury: "PRESIDENT" as RoleMembreJury,
    status: "PLANIFIEE",
  },
  {
    id: "2",
    etudiant: { nom: "Dubois", prenom: "Marie" },
    titre: "Intelligence artificielle appliquée à la détection de fraudes",
    departement: "Génie Informatique & Télécommunications",
    date: "2024-06-16",
    heureDebut: "14:00",
    salle: "Salle B205",
    roleJury: "RAPPORTEUR" as RoleMembreJury,
    status: "PLANIFIEE",
  },
  {
    id: "3",
    etudiant: { nom: "Bernard", prenom: "Lucas" },
    titre: "Conception d'un système IoT pour l'agriculture intelligente",
    departement: "Génie Électrique et Systèmes Intelligents",
    date: "2024-06-10",
    heureDebut: "09:00",
    salle: "Amphi C",
    roleJury: "EXAMINATEUR" as RoleMembreJury,
    status: "TERMINEE",
  },
  {
    id: "4",
    etudiant: { nom: "Kouassi", prenom: "Ange" },
    titre: "Optimisation des réseaux industriels",
    departement: "Génie Électrique et Systèmes Intelligents",
    date: "2024-06-17",
    heureDebut: "10:00",
    salle: "Salle B201",
    roleJury: "ENCADREUR" as RoleMembreJury,
    status: "PLANIFIEE",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  PLANIFIEE: { label: "Planifiée", color: "bg-blue-100 text-blue-700" },
  EN_COURS: { label: "En cours", color: "bg-amber-100 text-amber-700" },
  TERMINEE: { label: "Terminée", color: "bg-emerald-100 text-emerald-700" },
  ANNULEE: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

export default function MesSoutenancesPage() {
  const navigate = useNavigate();
  const [filterDepartement, setFilterDepartement] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Départements uniques
  const departementsUniques = [...new Set(soutenances.map(s => s.departement))];

  // Filtrage
  const soutenancesFiltered = soutenances.filter(s => {
    if (filterDepartement !== "all" && s.departement !== filterDepartement) return false;
    if (filterRole !== "all" && s.roleJury !== filterRole) return false;
    return true;
  });

  const soutenancesAVenir = soutenancesFiltered.filter(s => s.status !== "TERMINEE" && s.status !== "ANNULEE");
  const soutenancesPassees = soutenancesFiltered.filter(s => s.status === "TERMINEE" || s.status === "ANNULEE");

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
        <Select value={filterDepartement} onValueChange={setFilterDepartement}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {departementsUniques.map((dept) => (
              <SelectItem key={dept} value={dept} className="text-xs">{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {(Object.keys(ROLE_MEMBRE_JURY_LABELS) as RoleMembreJury[]).map((role) => (
              <SelectItem key={role} value={role} className="text-xs">{ROLE_MEMBRE_JURY_LABELS[role]}</SelectItem>
            ))}
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
                  onClick={() => navigate(`/memoires/${soutenance.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {soutenance.etudiant.prenom} {soutenance.etudiant.nom}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {ROLE_MEMBRE_JURY_LABELS[soutenance.roleJury]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{soutenance.titre}</p>
                      <span className={`text-[10px] ${deptColor.text}`}>{soutenance.departement}</span>
                      
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(soutenance.date).toLocaleDateString("fr-FR", { 
                              weekday: "short", 
                              day: "numeric", 
                              month: "short" 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{soutenance.heureDebut}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{soutenance.salle}</span>
                        </div>
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
              const status = statusConfig[soutenance.status];
              const deptColor = getDepartmentColor(soutenance.departement);
              return (
                <div 
                  key={soutenance.id} 
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer opacity-60 hover:opacity-100"
                  onClick={() => navigate(`/memoires/${soutenance.id}`)}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {soutenance.etudiant.prenom} {soutenance.etudiant.nom}
                      </span>
                      <Badge className={`text-[10px] font-normal ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{soutenance.titre}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{new Date(soutenance.date).toLocaleDateString("fr-FR")}</span>
                      <span className={deptColor.text}>{soutenance.departement}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {ROLE_MEMBRE_JURY_LABELS[soutenance.roleJury]}
                      </Badge>
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
