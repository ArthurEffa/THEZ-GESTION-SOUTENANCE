import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Phone, Calendar, Edit, Plus, FileText, Scale, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import candidatService from "@/services/candidatService";
import dossierService from "@/services/dossierService";
import { CYCLE_LABELS, STATUT_DOSSIER_LABELS, STATUT_SOUTENANCE_LABELS } from "@/types/models";
import { CreateDossierDialog } from "@/components/candidats/CreateDossierDialog";

export default function CandidatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDossierOpen, setCreateDossierOpen] = useState(false);

  // Charger les données du candidat
  const { data: candidat, isLoading, error } = useQuery({
    queryKey: ['candidat', id],
    queryFn: () => candidatService.getById(id!),
    enabled: Boolean(id),
  });

  // Charger les dossiers du candidat
  const { data: dossiers = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ['dossiers', 'candidat', id],
    queryFn: () => dossierService.getByCandidatId(id!),
    enabled: Boolean(id),
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !candidat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement du profil candidat</p>
        <Button onClick={() => navigate("/candidats")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/candidats")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {candidat.user.first_name} {candidat.user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Profil candidat - Matricule: {candidat.matricule}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/candidats/${id}/modifier`)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations personnelles */}
        <div className="space-y-6">
          {/* Photo et infos de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidat.photo && (
                <div className="flex justify-center">
                  <img
                    src={candidat.photo}
                    alt={`${candidat.user.first_name} ${candidat.user.last_name}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-border"
                  />
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidat.user.email}`} className="text-primary hover:underline">
                    {candidat.user.email}
                  </a>
                </div>

                {candidat.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{candidat.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Inscrit le {formatDate(candidat.user.date_joined)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cycle</span>
                  <Badge variant="outline">{CYCLE_LABELS[candidat.cycle]}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Département</span>
                  <Badge variant="secondary">
                    {candidat.departement ? candidat.departement.nom : "Non assigné"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Matricule</span>
                  <span className="font-mono text-sm">{candidat.matricule}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Dossiers et soutenances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossiers de soutenance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dossiers de soutenance
                  </CardTitle>
                  <CardDescription>
                    {dossiers.length === 0
                      ? "Aucun dossier créé"
                      : `${dossiers.length} dossier${dossiers.length > 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </div>
                {!candidat.has_dossier && (
                  <Button size="sm" onClick={() => setCreateDossierOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un dossier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDossiers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : dossiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun dossier de soutenance</p>
                  <p className="text-sm mt-1">Créez un dossier pour ce candidat</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{dossier.titre_memoire}</h4>
                            <Badge
                              variant="outline"
                              className={
                                dossier.statut === 'VALIDE'
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : dossier.statut === 'REJETE'
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : dossier.statut === 'DEPOSE'
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {STATUT_DOSSIER_LABELS[dossier.statut]}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Session: {dossier.session?.titre || 'Non définie'}</p>
                            {dossier.encadreur && (
                              <p>
                                Encadreur: {dossier.encadreur.nom_complet ||
                                  `${dossier.encadreur.user?.first_name || ''} ${dossier.encadreur.user?.last_name || ''}`.trim()}
                              </p>
                            )}
                            <p>Déposé le {formatDate(dossier.date_depot)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Soutenances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Soutenances
              </CardTitle>
              <CardDescription>
                Historique des soutenances du candidat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dossiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune soutenance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dossiers.map((dossier) => {
                    // Vérifier si le dossier a une soutenance (cette info devrait venir du backend)
                    // Pour l'instant on affiche juste les dossiers validés
                    if (dossier.statut !== 'VALIDE') return null;

                    return (
                      <div
                        key={dossier.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dossier.titre_memoire}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Session: {dossier.session?.titre || 'Non définie'}
                        </p>
                        {/* TODO: Afficher les détails de la soutenance quand disponible */}
                      </div>
                    );
                  })}
                  {dossiers.every(d => d.statut !== 'VALIDE') && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune soutenance planifiée</p>
                      <p className="text-sm mt-1">Les soutenances sont planifiées après validation des dossiers</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog pour créer un dossier */}
      <CreateDossierDialog
        open={createDossierOpen}
        onOpenChange={setCreateDossierOpen}
        candidatId={id!}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dossiers', 'candidat', id] });
          queryClient.invalidateQueries({ queryKey: ['candidat', id] });
          queryClient.invalidateQueries({ queryKey: ['candidats'] });
        }}
      />
    </div>
  );
}
