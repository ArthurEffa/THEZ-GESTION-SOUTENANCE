
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Users, Video, Loader2 } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetSalleById, useGetSoutenancesBySalle } from "@/hooks/salle-hooks";
import { STATUT_SOUTENANCE_LABELS } from "@/types/models";

// --- Aucune donnée fictive ici ---

const KpiItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
    <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    </div>
);

export default function SalleDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>ID de salle manquant</div>;

    // --- Données réelles provenant des hooks ---
    const { data: salle, isLoading: isLoadingSalle, isError: isErrorSalle } = useGetSalleById(id);
    const { data: soutenances = [], isLoading: isLoadingSoutenances } = useGetSoutenancesBySalle(id);

    if (isLoadingSalle) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (isErrorSalle || !salle) {
        return <div className="text-center py-10">Impossible de charger la salle. Elle n'existe peut-être pas.</div>;
    }

    // Calcul des KPIs réels
    const soutenancesAVenir = soutenances.filter(s => s.statut === 'PLANIFIEE' || s.statut === 'EN_COURS').length;

    return (
        <div className="space-y-6">
            {/* Header avec données réelles */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{salle.nom}</h1>
                        <p className="text-muted-foreground">{salle.batiment}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/salles/${id}/modifier`}>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-3">
                    <KpiItem icon={Users} value={salle.capacite} label="places" />
                    <KpiItem icon={Video} value={soutenancesAVenir} label="soutenances à venir" />
                    <Badge variant={salle.est_disponible ? "default" : "destructive"} className="ml-auto sm:ml-0">
                        {salle.est_disponible ? "Disponible" : "Indisponible"}
                    </Badge>
                </div>
            </div>

            {/* Planning Table avec données réelles */}
            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">Planning de la session en cours</h2>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Heure</TableHead>
                                    <TableHead>Candidat</TableHead>
                                    <TableHead>Titre du mémoire</TableHead>
                                    <TableHead className="text-right">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingSoutenances ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : soutenances.length > 0 ? (
                                    soutenances.map((soutenance) => (
                                        <TableRow key={soutenance.id}>
                                            <TableCell className="font-medium">{new Date(soutenance.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                                            <TableCell>{soutenance.dossier.candidat.nom_complet}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-sm truncate">{soutenance.dossier.titre_memoire}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={soutenance.statut === 'TERMINEE' ? 'secondary' : 'default'}>{STATUT_SOUTENANCE_LABELS[soutenance.statut]}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucune soutenance planifiée dans cette salle.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
