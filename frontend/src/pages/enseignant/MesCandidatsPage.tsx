import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  Building2,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getDepartmentColor } from "@/config/departments";
import { STATUT_DOSSIER_LABELS, type DossierSoutenance } from "@/types/models";
import dossierService from "@/services/dossierService";
import candidatService from "@/services/candidatService";

const statutConfig: Record<string, { label: string; color: string }> = {
  VALIDE: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
  DEPOSE: { label: "Déposé", color: "bg-blue-100 text-blue-700" },
  BROUILLON: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
};

export default function MesCandidatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dossiers encadrés (le backend filtre par encadreur connecté)
  const { data: dossiers = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ["mesDossiers"],
    queryFn: () => dossierService.getAll(),
  });

  // Tous les candidats visibles par l'enseignant (départements + encadrés + jury)
  const { data: candidats = [], isLoading: isLoadingCandidats } = useQuery({
    queryKey: ["mesCandidats"],
    queryFn: () => candidatService.getAll(),
  });

  const isLoading = isLoadingDossiers || isLoadingCandidats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Candidats encadrés = ceux qui ont un dossier encadré par l'enseignant
  const candidatsEncadres = dossiers.map((d) => ({
    id: d.candidat.id,
    nom: d.candidat.user.last_name,
    prenom: d.candidat.user.first_name,
    departement: d.candidat.departement?.nom || "",
    titreMemoire: d.titre_memoire,
    statut: d.statut,
    dossierId: d.id,
  }));

  // Candidats du département = tous les candidats visibles moins ceux déjà dans "encadrés"
  const encadresIds = new Set(candidatsEncadres.map((c) => c.id));
  const candidatsDepartement = candidats
    .filter((c) => !encadresIds.has(c.id))
    .map((c) => ({
      id: c.id,
      nom: c.user.last_name,
      prenom: c.user.first_name,
      departement: c.departement?.nom || "",
    }));

  return (
    <div className="max-w-4xl space-y-6">
      {/* En-tête */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Mes candidats
        </h1>
        <p className="text-muted-foreground text-sm">
          Candidats encadrés et du département
        </p>
      </div>

      <Tabs defaultValue="encadres" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="encadres" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Encadrés ({candidatsEncadres.length})
          </TabsTrigger>
          <TabsTrigger value="departement" className="text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Département ({candidatsDepartement.length})
          </TabsTrigger>
        </TabsList>

        {/* Candidats encadrés */}
        <TabsContent value="encadres" className="space-y-1 mt-4">
          {candidatsEncadres.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
              Aucun candidat encadré
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {candidatsEncadres.map((candidat) => {
                const deptColor = getDepartmentColor(candidat.departement);
                const status = statutConfig[candidat.statut] || {
                  label: candidat.statut,
                  color: "bg-muted text-muted-foreground",
                };
                return (
                  <div
                    key={candidat.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate("/memoires")}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {candidat.prenom} {candidat.nom}
                        </span>
                        <Badge
                          className={`text-[10px] font-normal ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidat.titreMemoire}
                      </p>
                      {candidat.departement && (
                        <span className={`text-[10px] ${deptColor.text}`}>
                          {candidat.departement}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Candidats du département */}
        <TabsContent value="departement" className="space-y-1 mt-4">
          {candidatsDepartement.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
              Aucun candidat dans le département
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {candidatsDepartement.map((candidat) => {
                const deptColor = getDepartmentColor(candidat.departement);
                return (
                  <div
                    key={candidat.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() =>
                      navigate(`/candidats/${candidat.id}`)
                    }
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {candidat.prenom} {candidat.nom}
                        </span>
                      </div>
                      {candidat.departement && (
                        <span className={`text-[10px] ${deptColor.text}`}>
                          {candidat.departement}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
