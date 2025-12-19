
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, MapPin, Clock, User, Users, FileText, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetSoutenanceById } from "@/hooks/soutenance-hooks";
import { STATUT_SOUTENANCE_LABELS, ROLE_MEMBRE_JURY_LABELS } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const InfoCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            {children}
        </CardContent>
    </Card>
);

export default function SoutenanceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: soutenance, isLoading, isError } = useGetSoutenanceById(id!);

  const formatDate = (date: string | null | undefined, formatStr: string) => {
      if (!date) return "N/A";
      try {
        return format(new Date(date), formatStr, { locale: fr });
      } catch {
        return "Date invalide";
      }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError || !soutenance) return <div className="text-center py-10">Erreur: Soutenance non trouvée.</div>;

  const { dossier, jury, salle, date_heure, duree_minutes, statut } = soutenance;

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
                    <span>Soutenance</span>
                    <Separator orientation="vertical" className="h-4"/>
                    <Badge variant="outline">{STATUT_SOUTENANCE_LABELS[statut]}</Badge>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/soutenances/${id}/modifier`}>
                      <Pencil className="mr-2 h-4 w-4" /> Modifier
                    </Link>
                  </Button>
                  {/* Delete button can be added here */}
              </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
            <InfoCard icon={Calendar} title="Planning">
                <div className="space-y-3 text-sm">
                    <p><strong>Date:</strong> {formatDate(date_heure, "eeee dd MMMM yyyy")}</p>
                    <p><strong>Heure:</strong> {formatDate(date_heure, "HH:mm")}</p>
                    <p><strong>Durée:</strong> {duree_minutes} minutes</p>
                </div>
            </InfoCard>

            {salle && (
                <InfoCard icon={MapPin} title="Salle">
                    <div className="space-y-1 text-sm">
                        <p className="font-bold text-base">{salle.nom}</p>
                        <p>{salle.batiment}</p>
                        <p className="text-muted-foreground">Capacité: {salle.capacite} places</p>
                    </div>
                </InfoCard>
            )}
            
            <InfoCard icon={User} title="Candidat">
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-base">{dossier.candidat.nom_complet}</p>
                  <p>{dossier.candidat.matricule}</p>
                  <Button variant="link" size="sm" className="-ml-3" asChild>
                    <Link to={`/candidats/${dossier.candidat.id}`}>Voir le profil</Link>
                  </Button>
                </div>
            </InfoCard>
        </div>

        {/* Right Column: Jury */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold">Composition du Jury</h2>
            {jury ? (
                <Card>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Rôle</TableHead>
                              <TableHead>Grade</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {jury.composition?.map(membre => (
                              <TableRow key={membre.id}>
                                  <TableCell className="font-medium">{membre.enseignant.nom_complet}</TableCell>
                                  <TableCell><Badge>{ROLE_MEMBRE_JURY_LABELS[membre.role]}</Badge></TableCell>
                                  <TableCell>{membre.enseignant.grade}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </Card>
            ) : (
                <div className="text-center py-10 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Aucun jury n'a été assigné à cette soutenance.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
