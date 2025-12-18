import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Phone, Calendar, Edit, FileText, Scale, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import enseignantService from "@/services/enseignantService";
import dossierService from "@/services/dossierService";
import juryService from "@/services/juryService";
import { GRADE_ENSEIGNANT_LABELS, STATUT_DOSSIER_LABELS, STATUT_JURY_LABELS, ROLE_MEMBRE_JURY_LABELS } from "@/types/models";

export default function EnseignantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Charger les données de l'enseignant
  const { data: enseignant, isLoading, error } = useQuery({
    queryKey: ['enseignant', id],
    queryFn: () => enseignantService.getById(id!),
    enabled: Boolean(id),
  });

  // Charger les dossiers encadrés
  const { data: dossiersEncadres = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ['dossiers', 'encadreur', id],
    queryFn: async () => {
      const allDossiers = await dossierService.getAll();
      return allDossiers.filter(d => d.encadreur_id === id);
    },
    enabled: Boolean(id),
  });

  // Charger les jurys dont il fait partie
  const { data: allJurys = [], isLoading: isLoadingJurys } = useQuery({
    queryKey: ['jurys'],
    queryFn: () => juryService.getAll(),
  });

  // Filtrer les jurys où l'enseignant est membre
  const jurysEnseignant = allJurys.filter(jury =>
    jury.composition?.some(membre => membre.enseignant_id === id)
  );

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

  if (error || !enseignant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement du profil enseignant</p>
        <Button onClick={() => navigate("/enseignants")}>
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/enseignants")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {enseignant.user.first_name} {enseignant.user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {GRADE_ENSEIGNANT_LABELS[enseignant.grade]}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/enseignants/${id}/modifier`)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations personnelles */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${enseignant.user.email}`} className="text-primary hover:underline">
                    {enseignant.user.email}
                  </a>
                </div>

                {enseignant.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{enseignant.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Inscrit le {formatDate(enseignant.user.date_joined)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Grade</span>
                  <Badge variant="outline">{GRADE_ENSEIGNANT_LABELS[enseignant.grade]}</Badge>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Départements</span>
                  <div className="flex flex-wrap gap-2">
                    {enseignant.departements && enseignant.departements.length > 0 ? (
                      enseignant.departements.map((dept) => (
                        <Badge key={dept.id} variant="secondary">
                          {dept.nom}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Aucun département</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Dossiers encadrés et Jurys */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossiers encadrés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dossiers encadrés
              </CardTitle>
              <CardDescription>
                {dossiersEncadres.length === 0
                  ? "Aucun dossier encadré"
                  : `${dossiersEncadres.length} dossier${dossiersEncadres.length > 1 ? 's' : ''} encadré${dossiersEncadres.length > 1 ? 's' : ''}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDossiers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : dossiersEncadres.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun dossier encadré</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dossiersEncadres.map((dossier) => (
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
                            <p>
                              Candidat: {dossier.candidat?.nom_complet ||
                                `${dossier.candidat?.user?.first_name || ''} ${dossier.candidat?.user?.last_name || ''}`.trim()}
                            </p>
                            <p>Session: {dossier.session?.titre || 'Non définie'}</p>
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

          {/* Jurys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Participations aux jurys
              </CardTitle>
              <CardDescription>
                {jurysEnseignant.length === 0
                  ? "Aucune participation"
                  : `${jurysEnseignant.length} jury${jurysEnseignant.length > 1 ? 's' : ''}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJurys ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : jurysEnseignant.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune participation à un jury</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jurysEnseignant.map((jury) => {
                    const membreInfo = jury.composition?.find(m => m.enseignant_id === id);
                    return (
                      <div
                        key={jury.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/jurys/${jury.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{jury.nom}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  jury.statut === 'ACTIF'
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : jury.statut === 'VALIDE'
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }
                              >
                                {STATUT_JURY_LABELS[jury.statut]}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Session: {jury.session?.titre || 'Non définie'}</p>
                              {membreInfo && (
                                <div className="flex items-center gap-2">
                                  <Award className="h-3.5 w-3.5" />
                                  <span className="font-medium text-primary">
                                    Rôle: {ROLE_MEMBRE_JURY_LABELS[membreInfo.role]}
                                  </span>
                                </div>
                              )}
                              <p>{jury.composition?.length || 0} membres au total</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
