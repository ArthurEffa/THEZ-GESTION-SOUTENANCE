
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, FileText, Calendar, Edit, CheckCircle, XCircle, Scale, Loader2, AlertCircle, Building, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DossierStatusBadge } from "@/components/common/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import dossierService from "@/services/dossierService";
import { useAuth } from "@/contexts/AuthContext";
import {
  STATUT_DOSSIER_LABELS,
  TYPE_DOCUMENT_LABELS,
} from "@/types/models";
import { useState } from "react";

const InfoItem = ({ icon: Icon, label, value, action }: { icon: React.ElementType, label: string, value: React.ReactNode, action?: React.ReactNode }) => (
    <div className="flex flex-col gap-1 p-4 border rounded-lg bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <div className="pl-6">
          <span className="text-sm font-semibold">{value}</span>
          {action && <div className="mt-1"> {action} </div>}
        </div>
    </div>
);

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [commentairesRejet, setCommentairesRejet] = useState("");

  const { data: dossier, isLoading, error } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => dossierService.getById(id!),
    enabled: Boolean(id),
  });

  const validerMutation = useMutation({
    mutationFn: () => dossierService.valider(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', id] });
      toast.success("Dossier validé");
    },
    onError: () => toast.error("Erreur validation"),
  });

  const rejeterMutation = useMutation({
    mutationFn: () => dossierService.rejeter(id!, commentairesRejet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', id] });
      toast.success("Dossier rejeté");
    },
    onError: () => toast.error("Erreur rejet"),
  });

  const formatDate = (date: string | null) => date ? format(new Date(date), "dd MMM yyyy, HH:mm", { locale: fr }) : "N/A";

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !dossier) return <div className="text-center py-10">Erreur: Dossier non trouvé.</div>;

  const isAdmin = user?.role === 'ADMIN';
  const canValidateOrReject = isAdmin && dossier.statut === 'DEPOSE';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight max-w-2xl">{dossier.titre_memoire}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Dossier de soutenance</span>
                  <Separator orientation="vertical" className="h-4"/>
                  <DossierStatusBadge status={dossier.statut} />
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Informations</h2>
            <InfoItem 
              icon={User} 
              label="Candidat" 
              value={dossier.candidat.nom_complet} 
              action={<Link to={`/candidats/${dossier.candidat.id}`} className="text-xs text-blue-600 hover:underline">Voir profil</Link>}
            />
            {dossier.encadreur && (
              <InfoItem 
                icon={Award} 
                label="Encadreur" 
                value={dossier.encadreur.nom_complet}
                action={<Link to={`/enseignants/${dossier.encadreur.id}`} className="text-xs text-blue-600 hover:underline">Voir profil</Link>}
              />
            )}
            <InfoItem 
              icon={Calendar} 
              label="Session" 
              value={dossier.session?.titre}
            />
            <Separator className="my-4"/>
             <div className="text-sm text-muted-foreground space-y-2">
                <p>Déposé le: <strong>{formatDate(dossier.date_depot)}</strong></p>
                {dossier.date_validation && <p>Validé le: <strong>{formatDate(dossier.date_validation)}</strong></p>}
             </div>
        </div>

        {/* Right Column: Content & Actions */}
        <div className="lg:col-span-2 space-y-10">
            {/* Documents */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Documents</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom du document</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dossier.documents && dossier.documents.length > 0 ? (
                                dossier.documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.nom}</TableCell>
                                        <TableCell><Badge variant="secondary">{TYPE_DOCUMENT_LABELS[doc.type_piece]}</Badge></TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="sm" asChild>
                                            <a href={doc.fichier} target="_blank" rel="noopener noreferrer">Voir</a>
                                          </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Aucun document.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Admin Actions / Comments */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Modération</h2>
                {canValidateOrReject ? (
                  <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                           <div>
                             <h3 className="font-medium">Valider le dossier</h3>
                             <p className="text-sm text-muted-foreground mb-4">Le statut passera à "Validé".</p>
                              <Button onClick={() => validerMutation.mutate()} disabled={validerMutation.isPending} className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" /> Valider
                              </Button>
                           </div>
                           <div className="space-y-2">
                              <h3 className="font-medium">Rejeter le dossier</h3>
                              <Textarea
                                placeholder="Motif du rejet..."
                                value={commentairesRejet}
                                onChange={(e) => setCommentairesRejet(e.target.value)}
                              />
                              <Button variant="destructive" onClick={() => rejeterMutation.mutate()} disabled={rejeterMutation.isPending || !commentairesRejet.trim()} className="w-full">
                                <XCircle className="mr-2 h-4 w-4" /> Rejeter
                              </Button>
                           </div>
                        </div>
                    </CardContent>
                  </Card>
                ) : dossier.commentaires_admin ? (
                    <div className="border-l-2 border-yellow-500 pl-4 italic text-muted-foreground">
                        <h3 className="font-medium not-italic text-foreground">Commentaire de l'administration</h3>
                        <p>"{dossier.commentaires_admin}"</p>
                    </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune action de modération requise ou historique disponible.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
