
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Phone, Calendar, Edit, Plus, FileText, Scale, Loader2, BadgeInfo, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import candidatService from "@/services/candidatService";
import dossierService from "@/services/dossierService";
import { CYCLE_LABELS, STATUT_DOSSIER_LABELS, STATUT_SOUTENANCE_LABELS } from "@/types/models";
import { CreateDossierDialog } from "@/components/candidats/CreateDossierDialog";

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    </div>
);

export default function CandidatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDossierOpen, setCreateDossierOpen] = useState(false);

  const { data: candidat, isLoading, error } = useQuery({
    queryKey: ['candidat', id],
    queryFn: () => candidatService.getById(id!),
    enabled: Boolean(id),
  });

  const { data: dossiers = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ['dossiers', 'candidat', id],
    queryFn: () => dossierService.getByCandidatId(id!),
    enabled: Boolean(id),
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error || !candidat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement du profil</p>
        <Button onClick={() => navigate("/candidats")}>Retour à la liste</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage src={candidat.photo} alt={`${candidat.user.first_name} ${candidat.user.last_name}`} />
                  <AvatarFallback className="text-xl">{candidat.user.first_name[0]}{candidat.user.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                      {candidat.user.first_name} {candidat.user.last_name}
                  </h1>
                  <p className="text-muted-foreground">Matricule: {candidat.matricule}</p>
              </div>
          </div>
        <div className="flex items-center gap-2">
            <Link to={`/candidats/${id}/modifier`}>
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button>
            </Link>
            {!candidat.has_dossier && (
                <Button size="sm" onClick={() => setCreateDossierOpen(true)}><Plus className="mr-2 h-4 w-4" />Créer un dossier</Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Colonne gauche - Informations */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Informations</h2>
            <div className="space-y-4">
                <InfoItem icon={Mail} label="Email" value={<a href={`mailto:${candidat.user.email}`} className="text-primary hover:underline">{candidat.user.email}</a>} />
                {candidat.user.phone && <InfoItem icon={Phone} label="Téléphone" value={candidat.user.phone} />}
                <InfoItem icon={Calendar} label="Inscrit le" value={formatDate(candidat.user.date_joined)} />
                <Separator />
                <InfoItem icon={BadgeInfo} label="Cycle" value={<Badge variant="outline">{CYCLE_LABELS[candidat.cycle]}</Badge>} />
                <InfoItem icon={Building} label="Département" value={candidat.departement ? candidat.departement.nom : "Non assigné"} />
            </div>
        </div>

        {/* Colonne droite - Activité */}
        <div className="lg:col-span-2 space-y-10">
            {/* Section Dossiers */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Dossiers de soutenance</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titre du mémoire</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Dépôt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingDossiers ? (
                                <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="inline-block h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : dossiers.length > 0 ? (
                                dossiers.map(dossier => (
                                    <TableRow key={dossier.id} onClick={() => navigate(`/dossiers/${dossier.id}`)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium max-w-xs truncate">{dossier.titre_memoire}</TableCell>
                                        <TableCell>{dossier.session?.titre || "-"}</TableCell>
                                        <TableCell><Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge></TableCell>
                                        <TableCell>{formatDate(dossier.date_depot)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Aucun dossier créé.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Section Soutenances */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Soutenances</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titre</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Jury</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Placeholder data - to be replaced with actual soutenance data */}
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Aucune soutenance planifiée.</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
      </div>

      <CreateDossierDialog
        open={createDossierOpen}
        onOpenChange={setCreateDossierOpen}
        candidatId={id!}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dossiers', 'candidat', id] });
          queryClient.invalidateQueries({ queryKey: ['candidat', id] });
        }}
      />
    </div>
  );
}
