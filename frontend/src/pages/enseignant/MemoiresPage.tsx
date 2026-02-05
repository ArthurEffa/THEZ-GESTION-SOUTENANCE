import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, User, Loader2 } from "lucide-react";
import { ROLE_MEMBRE_JURY_LABELS, type RoleMembreJury, type Soutenance } from "@/types/models";
import soutenanceService from "@/services/soutenanceService";
import dossierService from "@/services/dossierService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const roleColors: Record<string, string> = {
  PRESIDENT: "bg-primary/10 text-primary",
  RAPPORTEUR: "bg-warning/10 text-warning",
  EXAMINATEUR: "bg-muted text-muted-foreground",
  ENCADREUR: "bg-success/10 text-success",
};

interface MemoireItem {
  id: string;
  etudiant: { nom: string; prenom: string };
  titre: string;
  departement: string;
  dateDepot: string;
  role: string;
  roleKey: string;
  fichierUrl: string | null;
}

function findMyRole(soutenance: Soutenance, userId: string): RoleMembreJury | undefined {
  return soutenance.jury?.composition?.find(
    (m) => m.enseignant.user.id === userId
  )?.role;
}

export default function MemoiresPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Soutenances où l'enseignant est jury
  const { data: soutenances = [], isLoading: isLoadingSout } = useQuery({
    queryKey: ["mesSoutenances"],
    queryFn: () => soutenanceService.getMesSoutenances(),
  });

  // Dossiers encadrés
  const { data: dossiers = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ["mesDossiers"],
    queryFn: () => dossierService.getAll(),
  });

  const isLoading = isLoadingSout || isLoadingDossiers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Construire la liste des mémoires à partir des soutenances (rôle jury)
  const memoiresFromSoutenances: MemoireItem[] = soutenances
    .filter((s) => s.dossier)
    .map((s) => {
      const role = user ? findMyRole(s, user.id) : undefined;
      const memoireDoc = s.dossier.documents?.find(
        (d: any) => d.type_piece === "MEMOIRE"
      );
      return {
        id: `sout-${s.id}`,
        etudiant: {
          nom: s.dossier.candidat.user.last_name,
          prenom: s.dossier.candidat.user.first_name,
        },
        titre: s.dossier.titre_memoire,
        departement: s.dossier.candidat.departement?.nom || "",
        dateDepot: s.dossier.date_depot,
        role: role ? ROLE_MEMBRE_JURY_LABELS[role] : "Jury",
        roleKey: role || "EXAMINATEUR",
        fichierUrl: memoireDoc?.fichier || null,
      };
    });

  // Ajouter les dossiers encadrés qui ne sont pas déjà dans la liste
  const soutenanceDossierIds = new Set(
    soutenances.map((s) => s.dossier?.id).filter(Boolean)
  );
  const memoiresFromDossiers: MemoireItem[] = dossiers
    .filter((d) => !soutenanceDossierIds.has(d.id))
    .map((d) => {
      const memoireDoc = d.documents?.find(
        (doc: any) => doc.type_piece === "MEMOIRE"
      );
      return {
        id: `dossier-${d.id}`,
        etudiant: {
          nom: d.candidat.user.last_name,
          prenom: d.candidat.user.first_name,
        },
        titre: d.titre_memoire,
        departement: d.candidat.departement?.nom || "",
        dateDepot: d.date_depot,
        role: "Encadreur",
        roleKey: "ENCADREUR",
        fichierUrl: memoireDoc?.fichier || null,
      };
    });

  const allMemoires = [...memoiresFromSoutenances, ...memoiresFromDossiers];

  const filteredMemoires = allMemoires.filter(
    (m) =>
      m.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (memoire: MemoireItem) => {
    if (memoire.fichierUrl) {
      window.open(memoire.fichierUrl, "_blank");
    }
  };

  const handleView = (memoire: MemoireItem) => {
    if (memoire.fichierUrl) {
      window.open(memoire.fichierUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mémoires"
        description="Consultez les mémoires des étudiants dont vous êtes jury ou encadreur"
        icon={FileText}
      />

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par étudiant ou titre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Liste des mémoires */}
      {filteredMemoires.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun mémoire trouvé</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Aucun résultat ne correspond à votre recherche"
                : "Vous n'avez accès à aucun mémoire pour le moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMemoires.map((memoire) => (
            <Card key={memoire.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">
                          {memoire.titre}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            {memoire.etudiant.prenom} {memoire.etudiant.nom}
                          </span>
                          {memoire.departement && (
                            <>
                              <span className="mx-1">-</span>
                              <span>{memoire.departement}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <Badge className={roleColors[memoire.roleKey] || roleColors.EXAMINATEUR}>
                        {memoire.role}
                      </Badge>
                      {memoire.dateDepot && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Déposé le{" "}
                          {format(new Date(memoire.dateDepot), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(memoire)}
                        disabled={!memoire.fichierUrl}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(memoire)}
                        disabled={!memoire.fichierUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
