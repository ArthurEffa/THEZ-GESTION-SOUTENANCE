import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, FileText, Calendar, Edit, CheckCircle, XCircle, Scale, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import dossierService from "@/services/dossierService";
import { useAuth } from "@/contexts/AuthContext";
import {
  CYCLE_LABELS,
  STATUT_DOSSIER_LABELS,
  GRADE_ENSEIGNANT_LABELS,
  TYPE_DOCUMENT_LABELS,
} from "@/types/models";
import { useState } from "react";

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [commentairesRejet, setCommentairesRejet] = useState("");

  // Charger les données du dossier
  const { data: dossier, isLoading, error } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => dossierService.getById(id!),
    enabled: Boolean(id),
  });

  // Mutation pour valider
  const validerMutation = useMutation({
    mutationFn: () => dossierService.valider(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', id] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast.success("Dossier validé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la validation du dossier");
    },
  });

  // Mutation pour rejeter
  const rejeterMutation = useMutation({
    mutationFn: () => dossierService.rejeter(id!, commentairesRejet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', id] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast.success("Dossier rejeté");
      setCommentairesRejet("");
    },
    onError: () => {
      toast.error("Erreur lors du rejet du dossier");
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return "bg-green-100 text-green-800 border-green-200";
      case 'REJETE':
        return "bg-red-100 text-red-800 border-red-200";
      case 'DEPOSE':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'BROUILLON':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement du dossier</p>
        <Button onClick={() => navigate("/candidats")}>
          Retour
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const canValidate = isAdmin && dossier.statut === 'DEPOSE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {dossier.titre_memoire}
            </h1>
            <p className="text-sm text-muted-foreground">
              Dossier de soutenance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatutColor(dossier.statut)}>
            {STATUT_DOSSIER_LABELS[dossier.statut]}
          </Badge>
          {isAdmin && dossier.statut !== 'VALIDE' && dossier.statut !== 'REJETE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dossiers/${id}/modifier`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations générales */}
        <div className="space-y-6">
          {/* Candidat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">
                  {dossier.candidat.nom_complet ||
                    `${dossier.candidat.user?.first_name} ${dossier.candidat.user?.last_name}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Matricule: {dossier.candidat.matricule}
                </p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cycle</span>
                  <Badge variant="outline">{CYCLE_LABELS[dossier.candidat.cycle]}</Badge>
                </div>
                {dossier.candidat.user?.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <a
                      href={`mailto:${dossier.candidat.user.email}`}
                      className="text-primary hover:underline text-xs"
                    >
                      {dossier.candidat.user.email}
                    </a>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/candidats/${dossier.candidat_id}`)}
              >
                Voir le profil
              </Button>
            </CardContent>
          </Card>

          {/* Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{dossier.session?.titre}</p>
                <p className="text-sm text-muted-foreground">
                  {dossier.session?.annee_academique}
                </p>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Niveau: {dossier.session?.niveau_concerne}</p>
                <p>
                  Ouverture:{" "}
                  {dossier.session?.date_ouverture &&
                    format(new Date(dossier.session.date_ouverture), "dd MMM yyyy", {
                      locale: fr,
                    })}
                </p>
                <p>
                  Clôture:{" "}
                  {dossier.session?.date_cloture &&
                    format(new Date(dossier.session.date_cloture), "dd MMM yyyy", {
                      locale: fr,
                    })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Encadreur */}
          {dossier.encadreur && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Encadreur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">
                    {dossier.encadreur.nom_complet ||
                      `${dossier.encadreur.user?.first_name} ${dossier.encadreur.user?.last_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {GRADE_ENSEIGNANT_LABELS[dossier.encadreur.grade]}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/enseignants/${dossier.encadreur_id}`)}
                >
                  Voir le profil
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite - Documents et actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du dossier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations du dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Date de dépôt</p>
                  <p className="font-medium">{formatDate(dossier.date_depot)}</p>
                </div>
                {dossier.date_validation && (
                  <div>
                    <p className="text-muted-foreground mb-1">Date de validation</p>
                    <p className="font-medium">{formatDate(dossier.date_validation)}</p>
                  </div>
                )}
              </div>

              {dossier.commentaires_admin && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Commentaires administrateur</p>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {dossier.commentaires_admin}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                {dossier.documents?.length || 0} document
                {(dossier.documents?.length || 0) > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!dossier.documents || dossier.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun document téléversé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dossier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.nom}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_DOCUMENT_LABELS[doc.type_piece]}
                          </Badge>
                          {doc.est_obligatoire && (
                            <Badge variant="outline" className="text-xs">
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.fichier, "_blank")}
                      >
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions admin */}
          {canValidate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Actions administrateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => validerMutation.mutate()}
                    disabled={validerMutation.isPending}
                  >
                    {validerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Valider le dossier
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="commentaires">Commentaires de rejet</Label>
                  <Textarea
                    id="commentaires"
                    placeholder="Expliquez les raisons du rejet..."
                    value={commentairesRejet}
                    onChange={(e) => setCommentairesRejet(e.target.value)}
                    rows={4}
                  />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => rejeterMutation.mutate()}
                    disabled={rejeterMutation.isPending || !commentairesRejet.trim()}
                  >
                    {rejeterMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Rejeter le dossier
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerte si rejeté */}
          {dossier.statut === 'REJETE' && dossier.commentaires_admin && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Dossier rejeté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{dossier.commentaires_admin}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
