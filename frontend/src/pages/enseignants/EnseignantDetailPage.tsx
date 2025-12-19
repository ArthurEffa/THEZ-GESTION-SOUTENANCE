
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Phone, Calendar, Edit, FileText, Scale, Award, Loader2, Building, BadgeInfo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import enseignantService from "@/services/enseignantService";
import dossierService from "@/services/dossierService";
import juryService from "@/services/juryService";
import { GRADE_ENSEIGNANT_LABELS, STATUT_DOSSIER_LABELS, STATUT_JURY_LABELS, ROLE_MEMBRE_JURY_LABELS } from "@/types/models";

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    </div>
);

export default function EnseignantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: enseignant, isLoading, error } = useQuery({
    queryKey: ['enseignant', id],
    queryFn: () => enseignantService.getById(id!),
    enabled: Boolean(id),
  });

  const { data: dossiersEncadres = [], isLoading: isLoadingDossiers } = useQuery({
    queryKey: ['dossiers', 'encadreur', id],
    queryFn: () => dossierService.getByEncadreurId(id!),
    enabled: Boolean(id),
  });

  const { data: jurysEnseignant = [], isLoading: isLoadingJurys } = useQuery({
      queryKey: ['jurys', 'enseignant', id],
      queryFn: () => juryService.getByEnseignantId(id!),
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

  if (error || !enseignant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement du profil</p>
        <Button onClick={() => navigate("/enseignants")}>Retour à la liste</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarFallback className="text-xl">{enseignant.user.first_name[0]}{enseignant.user.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                      {enseignant.user.first_name} {enseignant.user.last_name}
                  </h1>
                  <p className="text-muted-foreground">{GRADE_ENSEIGNANT_LABELS[enseignant.grade]}</p>
              </div>
          </div>
        <div className="flex items-center gap-2">
            <Link to={`/enseignants/${id}/modifier`}>
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Colonne gauche - Informations */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Informations</h2>
            <div className="space-y-4">
                <InfoItem icon={Mail} label="Email" value={<a href={`mailto:${enseignant.user.email}`} className="text-primary hover:underline">{enseignant.user.email}</a>} />
                <InfoItem icon={Phone} label="Téléphone" value={enseignant.user.phone || "Non renseigné"} />
                <Separator />
                <InfoItem icon={Award} label="Grade" value={<Badge variant="outline">{GRADE_ENSEIGNANT_LABELS[enseignant.grade]}</Badge>} />
                <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Départements</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                        {enseignant.departements && enseignant.departements.length > 0 ? (
                          enseignant.departements.map((dept) => (
                            <Badge key={dept.id} variant="secondary">{dept.nom}</Badge>
                          ))
                        ) : (
                          <span className="text-sm font-medium">Aucun</span>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Colonne droite - Activité */}
        <div className="lg:col-span-2 space-y-10">
            {/* Section Dossiers Encadrés */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Dossiers Encadrés</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidat</TableHead>
                                <TableHead>Titre du mémoire</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingDossiers ? (
                                <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="inline-block h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : dossiersEncadres.length > 0 ? (
                                dossiersEncadres.map(dossier => (
                                    <TableRow key={dossier.id} onClick={() => navigate(`/dossiers/${dossier.id}`)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{dossier.candidat?.nom_complet}</TableCell>
                                        <TableCell className="max-w-xs truncate">{dossier.titre_memoire}</TableCell>
                                        <TableCell><Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Aucun dossier encadré.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Section Participations aux Jurys */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Participations aux Jurys</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom du Jury</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingJurys ? (
                                <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="inline-block h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : jurysEnseignant.length > 0 ? (
                                jurysEnseignant.map(jury => {
                                    const membreInfo = jury.composition?.find(m => m.enseignant_id === id);
                                    return (
                                        <TableRow key={jury.id} onClick={() => navigate(`/jurys/${jury.id}`)} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell className="font-medium">{jury.nom}</TableCell>
                                            <TableCell>{jury.session?.titre || "-"}</TableCell>
                                            <TableCell>{membreInfo ? ROLE_MEMBRE_JURY_LABELS[membreInfo.role] : "-"}</TableCell>
                                            <TableCell><Badge variant="outline">{STATUT_JURY_LABELS[jury.statut]}</Badge></TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Aucune participation à un jury.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
