import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, User, Calendar } from "lucide-react";

// Données de démonstration
const memoires = [
  {
    id: "1",
    etudiant: { nom: "Martin", prenom: "Pierre" },
    titre: "Développement d'une application mobile de suivi sportif",
    filiere: "Informatique",
    dateDepot: "2024-05-20",
    role: "Président",
    fichierUrl: "/memoires/martin-pierre.pdf",
  },
  {
    id: "2",
    etudiant: { nom: "Dubois", prenom: "Marie" },
    titre: "Intelligence artificielle appliquée à la détection de fraudes",
    filiere: "Data Science",
    dateDepot: "2024-05-22",
    role: "Rapporteur",
    fichierUrl: "/memoires/dubois-marie.pdf",
  },
  {
    id: "3",
    etudiant: { nom: "Bernard", prenom: "Lucas" },
    titre: "Conception d'un système IoT pour l'agriculture intelligente",
    filiere: "Systèmes Embarqués",
    dateDepot: "2024-05-15",
    role: "Encadreur",
    fichierUrl: "/memoires/bernard-lucas.pdf",
  },
];

const roleColors: Record<string, string> = {
  "Président": "bg-primary/10 text-primary",
  "Rapporteur": "bg-warning/10 text-warning",
  "Examinateur": "bg-muted text-muted-foreground",
  "Encadreur": "bg-success/10 text-success",
};

export default function MemoiresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMemoires = memoires.filter(
    (m) =>
      m.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (memoire: typeof memoires[0]) => {
    // Simulation de téléchargement
    console.log("Téléchargement:", memoire.fichierUrl);
  };

  const handleView = (memoire: typeof memoires[0]) => {
    // Simulation d'ouverture
    console.log("Consultation:", memoire.fichierUrl);
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
                        <h3 className="font-medium line-clamp-1">{memoire.titre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{memoire.etudiant.prenom} {memoire.etudiant.nom}</span>
                          <span className="mx-1">•</span>
                          <span>{memoire.filiere}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <Badge className={roleColors[memoire.role]}>
                        {memoire.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Déposé le {new Date(memoire.dateDepot).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(memoire)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(memoire)}
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
