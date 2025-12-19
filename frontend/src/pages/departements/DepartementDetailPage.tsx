
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDepartementById, useGetEnseignantsByDepartement, useGetCandidatsByDepartement } from "@/hooks/departements-hooks";
import { Edit, FileDown, Users, GraduationCap, Loader2 } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { CandidatProfile, EnseignantProfile } from "@/types/models";

const KpiItem = ({ icon: Icon, value, title, color }: { icon: React.ElementType, value: number, title: string, color: string }) => (
    <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base">{value}</span>
            <span className="text-xs text-muted-foreground">{title}</span>
        </div>
    </div>
);

export default function DepartementDetailPage() {
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>ID du département manquant</div>;

    const { data: departement, isLoading, isError } = useGetDepartementById(id);
    const { data: enseignants, isLoading: isLoadingEnseignants } = useGetEnseignantsByDepartement(id);
    const { data: candidats, isLoading: isLoadingCandidats } = useGetCandidatsByDepartement(id);

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (isError || !departement) return <div>Erreur de chargement.</div>;

    return (
        <div className="space-y-6">
            {/* Compact Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">{departement.nom}</h1>
                    <div className="flex items-center gap-x-4 gap-y-2 text-sm flex-wrap">
                        <p className="text-muted-foreground">Code: {departement.code}</p>
                        <Separator orientation="vertical" className="h-4" />
                        <KpiItem icon={Users} value={departement.nb_candidats} title="Étudiants" color="text-sky-500" />
                        <KpiItem icon={GraduationCap} value={departement.nb_enseignants} title="Enseignants" color="text-purple-500" />
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/departements/${id}/modifier`}>
                        <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Modifier</Button>
                    </Link>
                    <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" />Exporter</Button>
                </div>
            </div>

            {/* Tabs for content */}
            <Tabs defaultValue="enseignants" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="enseignants">Enseignants</TabsTrigger>
                    <TabsTrigger value="candidats">Candidats</TabsTrigger>
                </TabsList>
                <TabsContent value="enseignants">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingEnseignants ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="inline-block h-6 w-6 animate-spin" /></TableCell></TableRow>
                                    ) : enseignants && enseignants.length > 0 ? (
                                        enseignants.map((enseignant: EnseignantProfile) => (
                                            <TableRow key={enseignant.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{enseignant.user.first_name} {enseignant.user.last_name}</TableCell>
                                                <TableCell>{enseignant.grade}</TableCell>
                                                <TableCell>{enseignant.user.email}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Aucun enseignant trouvé.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="candidats">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Cycle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingCandidats ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="inline-block h-6 w-6 animate-spin" /></TableCell></TableRow>
                                    ) : candidats && candidats.length > 0 ? (
                                        candidats.map((candidat: CandidatProfile) => (
                                            <TableRow key={candidat.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{candidat.user.first_name} {candidat.user.last_name}</TableCell>
                                                <TableCell>{candidat.matricule}</TableCell>
                                                <TableCell>{candidat.cycle}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Aucun candidat trouvé.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
