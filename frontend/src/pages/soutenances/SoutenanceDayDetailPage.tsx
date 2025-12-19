import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// --- FAKE DATA ---
const FAKE_SOUTENANCES_FOR_DAY = [
  { id: "1", date: new Date(2024, 11, 16, 9, 0), candidat: "Marie Martin", memoire: "Développement d'une application IoT", statut: "TERMINEE", salle: "A101", jury: "Jury IA" },
  { id: "2", date: new Date(2024, 11, 16, 10, 30), candidat: "Paul Dubois", memoire: "Conception d'un pont suspendu", statut: "TERMINEE", salle: "B204", jury: "Jury GC" },
  { id: "3", date: new Date(2024, 11, 16, 14, 0), candidat: "Alice Dupont", memoire: "Optimisation des requêtes SQL", statut: "TERMINEE", salle: "A101", jury: "Jury IA" },
];
// -----------------

export default function SoutenanceDayDetailPage() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  const formattedDate = date ? format(parseISO(date), "eeee dd MMMM yyyy", { locale: fr }) : "Date non valide";

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/soutenances")} className="-ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au calendrier
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Planning du {formattedDate}</h1>
        </div>

        <Card>
            <CardContent className="pt-6">
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Heure</TableHead>
                                <TableHead>Candidat</TableHead>
                                <TableHead>Titre du Mémoire</TableHead>
                                <TableHead>Salle</TableHead>
                                <TableHead>Jury</TableHead>
                                <TableHead className="text-right">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {FAKE_SOUTENANCES_FOR_DAY.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono font-medium">{format(s.date, "HH:mm")}</TableCell>
                                    <TableCell className="font-semibold">{s.candidat}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{s.memoire}</TableCell>
                                    <TableCell>{s.salle}</TableCell>
                                    <TableCell>{s.jury}</TableCell>
                                    <TableCell className="text-right"><Badge>{s.statut}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
