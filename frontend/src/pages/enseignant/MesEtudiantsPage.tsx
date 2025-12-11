import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap,
  Building2,
  FileText,
  ChevronRight
} from "lucide-react";
import { getDepartmentColor } from "@/config/departments";

// Données de démonstration - étudiants encadrés
const etudiantsEncadres = [
  { id: "1", nom: "Martin", prenom: "Pierre", departement: "Génie Informatique & Télécommunications", titreMemoire: "Application mobile de suivi sportif", statut: "VALIDE" },
  { id: "2", nom: "Dupont", prenom: "Marie", departement: "Génie Informatique & Télécommunications", titreMemoire: "Système de gestion IoT", statut: "DEPOSE" },
];

// Données de démonstration - étudiants du département
const etudiantsDepartement = [
  { id: "1", nom: "Martin", prenom: "Pierre", titreMemoire: "Application mobile de suivi sportif", encadreur: "Dr. Koffi", statut: "VALIDE" },
  { id: "2", nom: "Dupont", prenom: "Marie", titreMemoire: "Système de gestion IoT", encadreur: "Dr. Kouadio", statut: "DEPOSE" },
  { id: "3", nom: "Bernard", prenom: "Jean", titreMemoire: "Analyse de données avec ML", encadreur: "Pr. Mensah", statut: "BROUILLON" },
  { id: "4", nom: "Konan", prenom: "Aya", titreMemoire: "Plateforme e-learning", encadreur: "Dr. Koffi", statut: "VALIDE" },
];

const statutConfig: Record<string, { label: string; color: string }> = {
  VALIDE: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
  DEPOSE: { label: "Déposé", color: "bg-blue-100 text-blue-700" },
  BROUILLON: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
};

export default function MesEtudiantsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl space-y-6">
      {/* En-tête */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Mes étudiants
        </h1>
        <p className="text-muted-foreground text-sm">
          Étudiants encadrés et du département
        </p>
      </div>

      <Tabs defaultValue="encadres" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="encadres" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Encadrés ({etudiantsEncadres.length})
          </TabsTrigger>
          <TabsTrigger value="departement" className="text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Département ({etudiantsDepartement.length})
          </TabsTrigger>
        </TabsList>

        {/* Étudiants encadrés */}
        <TabsContent value="encadres" className="space-y-1 mt-4">
          {etudiantsEncadres.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Aucun étudiant encadré
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {etudiantsEncadres.map((etudiant) => {
                const deptColor = getDepartmentColor(etudiant.departement);
                const status = statutConfig[etudiant.statut];
                return (
                  <div 
                    key={etudiant.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate("/memoires")}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{etudiant.prenom} {etudiant.nom}</span>
                        <Badge className={`text-[10px] font-normal ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{etudiant.titreMemoire}</p>
                      <span className={`text-[10px] ${deptColor.text}`}>{etudiant.departement}</span>
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

        {/* Étudiants du département */}
        <TabsContent value="departement" className="space-y-1 mt-4">
          {etudiantsDepartement.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Aucun étudiant dans le département
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {etudiantsDepartement.map((etudiant) => {
                const status = statutConfig[etudiant.statut];
                return (
                  <div 
                    key={etudiant.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate("/memoires")}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{etudiant.prenom} {etudiant.nom}</span>
                        <Badge className={`text-[10px] font-normal ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{etudiant.titreMemoire}</p>
                      <p className="text-[10px] text-muted-foreground">Encadreur: {etudiant.encadreur}</p>
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
      </Tabs>
    </div>
  );
}
