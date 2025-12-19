import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2, FileText, Clock, Users, Mic } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetSessionById, useGetDossiersBySession, useGetJurysBySession, useGetSoutenancesBySession } from "@/hooks/session-hooks";
import { STATUT_SESSION_LABELS, STATUT_DOSSIER_LABELS, STATUT_JURY_LABELS, STATUT_SOUTENANCE_LABELS } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <Card>
        <CardContent className="pt-6 flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <Icon className="h-6 w-6 text-muted-foreground" />
        </CardContent>
    </Card>
);

export default function SessionDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>ID de session manquant</div>;

    const { data: session, isLoading: isLoadingSession, isError } = useGetSessionById(id);
    const { data: dossiers = [], isLoading: isLoadingDossiers } = useGetDossiersBySession(id);
    const { data: jurys = [], isLoading: isLoadingJurys } = useGetJurysBySession(id);
    const { data: soutenances = [], isLoading: isLoadingSoutenances } = useGetSoutenancesBySession(id);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: fr });
        } catch {
            return dateStr;
        }
    }

    if (isLoadingSession) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (isError || !session) return <div className="text-center py-10">Erreur: Session non trouvée.</div>;

    const dossiersEnAttente = dossiers.filter(d => d.statut === 'DEPOSE').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{session.titre}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{session.annee_academique}</span> • <span>{session.niveau_concerne}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-base">{STATUT_SESSION_LABELS[session.statut]}</Badge>
                    <Link to={`/sessions/${id}/modifier`}><Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button></Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Dossiers Soumis" value={dossiers.length} icon={FileText} />
                <KpiCard title="Dossiers en Attente" value={dossiersEnAttente} icon={Clock} />
                <KpiCard title="Jurys Formés" value={jurys.length} icon={Users} />
                <KpiCard title="Soutenances Planifiées" value={soutenances.length} icon={Mic} />
            </div>

            <Tabs defaultValue="dossiers">
                <TabsList className="grid w-full grid-cols-3 md:w-fit">
                    <TabsTrigger value="dossiers">Dossiers ({dossiers.length})</TabsTrigger>
                    <TabsTrigger value="jurys">Jurys ({jurys.length})</TabsTrigger>
                    <TabsTrigger value="soutenances">Soutenances ({soutenances.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="dossiers">
                    <Card><CardContent className="pt-6">{isLoadingDossiers ? <Loader2/> : <Table>
                        <TableHeader><TableRow><TableHead>Candidat</TableHead><TableHead>Titre</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                        <TableBody>{dossiers.map(d => <TableRow key={d.id} onClick={() => navigate(`/dossiers/${d.id}`)} className="cursor-pointer"><TableCell>{d.candidat_nom}</TableCell><TableCell>{d.titre_memoire}</TableCell><TableCell><Badge>{STATUT_DOSSIER_LABELS[d.statut]}</Badge></TableCell></TableRow>)}</TableBody>
                    </Table>}</CardContent></Card>
                </TabsContent>

                <TabsContent value="jurys">
                    <Card><CardContent className="pt-6">{isLoadingJurys ? <Loader2/> : <Table>
                        <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Président</TableHead><TableHead>Membres</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                        <TableBody>{jurys.map(j => <TableRow key={j.id} onClick={() => navigate(`/jurys/${j.id}`)} className="cursor-pointer"><TableCell>{j.nom}</TableCell><TableCell>{j.president}</TableCell><TableCell>{j.nb_membres}</TableCell><TableCell><Badge>{STATUT_JURY_LABELS[j.statut]}</Badge></TableCell></TableRow>)}</TableBody>
                    </Table>}</CardContent></Card>
                </TabsContent>

                <TabsContent value="soutenances">
                     <Card><CardContent className="pt-6">{isLoadingSoutenances ? <Loader2/> : <Table>
                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Candidat</TableHead><TableHead>Salle</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                        <TableBody>{soutenances.map(s => <TableRow key={s.id} onClick={() => navigate(`/soutenances/${s.id}`)} className="cursor-pointer"><TableCell>{formatDate(s.date_heure)}</TableCell><TableCell>{s.candidat_nom}</TableCell><TableCell>{s.salle_nom}</TableCell><TableCell><Badge>{STATUT_SOUTENANCE_LABELS[s.statut]}</Badge></TableCell></TableRow>)}</TableBody>
                    </Table>}</CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
