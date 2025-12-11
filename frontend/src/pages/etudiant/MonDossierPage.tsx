import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import dossierHeroImg from "@/assets/illustrations/dossier-hero.png";

type DossierStatus = "brouillon" | "soumis" | "valide" | "rejete";

interface Dossier {
  titre: string;
  description: string;
  memoireUrl: string | null;
  annexesUrls: string[];
  status: DossierStatus;
  dateDepot: string | null;
}

const statusConfig: Record<DossierStatus, { label: string; color: string; icon: React.ElementType }> = {
  brouillon: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: Clock },
  soumis: { label: "Soumis", color: "bg-warning/10 text-warning", icon: Clock },
  valide: { label: "Validé", color: "bg-success/10 text-success", icon: CheckCircle },
  rejete: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

export default function MonDossierPage() {
  const { user } = useAuth();
  const [dossier, setDossier] = useState<Dossier>({
    titre: "",
    description: "",
    memoireUrl: null,
    annexesUrls: [],
    status: "brouillon",
    dateDepot: null,
  });

  const StatusIcon = statusConfig[dossier.status].icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dossier.titre.trim()) {
      toast.error("Le titre du mémoire est requis");
      return;
    }
    
    if (!dossier.memoireUrl) {
      toast.error("Veuillez déposer votre mémoire (PDF)");
      return;
    }

    setDossier(prev => ({
      ...prev,
      status: "soumis",
      dateDepot: new Date().toISOString(),
    }));
    toast.success("Dossier soumis avec succès !");
  };

  const handleFileUpload = (type: "memoire" | "annexe") => {
    // Simulation d'upload - à connecter avec Supabase Storage
    if (type === "memoire") {
      setDossier(prev => ({ ...prev, memoireUrl: "memoire.pdf" }));
      toast.success("Mémoire téléchargé");
    } else {
      setDossier(prev => ({ 
        ...prev, 
        annexesUrls: [...prev.annexesUrls, `annexe-${prev.annexesUrls.length + 1}.pdf`] 
      }));
      toast.success("Annexe ajoutée");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon dossier de soutenance"
        description="Créez et gérez votre dossier de soutenance"
        icon={FolderOpen}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations du mémoire</CardTitle>
            <CardDescription>
              Renseignez les informations de votre mémoire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du mémoire *</Label>
                <Input
                  id="titre"
                  value={dossier.titre}
                  onChange={(e) => setDossier(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Ex: Conception d'une application de gestion..."
                  disabled={dossier.status !== "brouillon"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Résumé</Label>
                <Textarea
                  id="description"
                  value={dossier.description}
                  onChange={(e) => setDossier(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez brièvement le contenu de votre mémoire..."
                  rows={4}
                  disabled={dossier.status !== "brouillon"}
                />
              </div>

              {/* Upload mémoire */}
              <div className="space-y-2">
                <Label>Mémoire (PDF) *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {dossier.memoireUrl ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <FileText className="h-5 w-5" />
                      <span>{dossier.memoireUrl}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Glissez votre fichier ou cliquez pour sélectionner
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileUpload("memoire")}
                        disabled={dossier.status !== "brouillon"}
                      >
                        Sélectionner un fichier
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Upload annexes */}
              <div className="space-y-2">
                <Label>Annexes (optionnel)</Label>
                <div className="space-y-2">
                  {dossier.annexesUrls.map((annexe, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{annexe}</span>
                    </div>
                  ))}
                  {dossier.status === "brouillon" && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFileUpload("annexe")}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter une annexe
                    </Button>
                  )}
                </div>
              </div>

              {dossier.status === "brouillon" && (
                <Button type="submit" className="w-full">
                  Soumettre mon dossier
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sidebar statut */}
        <div className="space-y-6">
          {/* Illustration */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-center">
              <div className="w-40 h-40 overflow-hidden">
                <img 
                  src={dossierHeroImg} 
                  alt="Gestion de dossier" 
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statut du dossier</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={statusConfig[dossier.status].color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[dossier.status].label}
              </Badge>
              {dossier.dateDepot && (
                <p className="text-xs text-muted-foreground mt-2">
                  Déposé le {new Date(dossier.dateDepot).toLocaleDateString("fr-FR")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Candidat</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
