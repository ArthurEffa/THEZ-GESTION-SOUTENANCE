import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2, Users, Calendar, Award } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetJuryById, useGetSoutenancesByJury } from "@/hooks/jury-hooks";
import { STATUT_JURY_LABELS, ROLE_MEMBRE_JURY_LABELS, GRADE_ENSEIGNANT_LABELS } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function JuryDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>ID de jury manquant</div>;

    const { data: jury, isLoading: isLoadingJury, isError } = useGetJuryById(id);
    const { data: soutenances = [], isLoading: isLoadingSoutenances } = useGetSoutenancesByJury(id);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: fr });
        } catch { return dateStr; }
    }

    if (isLoadingJury) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (isError || !jury) return <div className="text-center py-10">Erreur: Jury non trouvé.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{jury.nom}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{jury.session?.titre || "Session non définie"}</span> • <Badge variant="secondary">{STATUT_JURY_LABELS[jury.statut]}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/jurys/${id}/modifier`}><Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button></Link>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Composition */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">Composition du Jury</h2>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom de l'enseignant</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jury.composition && jury.composition.length > 0 ? (
                                    jury.composition.map((membre) => (
                                        <TableRow key={membre.id}>
                                            <TableCell className="font-medium">{membre.enseignant.nom_complet}</TableCell>
                                            <TableCell><Badge>{ROLE_MEMBRE_JURY_LABELS[membre.role]}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{GRADE_ENSEIGNANT_LABELS[membre.enseignant.grade]}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Aucun membre dans ce jury.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Right Column: Planning */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Soutenances Assignées</h2>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            {isLoadingSoutenances ? (
                                <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                            ) : soutenances.length > 0 ? (
                                soutenances.map(soutenance => (
                                    <div key={soutenance.id} className="p-3 border-b last:border-b-0">
                                        <p className="font-medium text-sm">{soutenance.candidat_nom}</p>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(soutenance.date_heure)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Aucune soutenance assignée.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
