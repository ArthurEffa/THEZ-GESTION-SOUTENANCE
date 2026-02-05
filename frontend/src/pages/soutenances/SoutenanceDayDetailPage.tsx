import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { StatusBadge, type SoutenanceStatus } from "@/components/common/StatusBadge";
import soutenanceService from "@/services/soutenanceService";

export default function SoutenanceDayDetailPage() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  const { data: allSoutenances = [], isLoading } = useQuery({
    queryKey: ["soutenances"],
    queryFn: () => soutenanceService.getAll(),
  });

  const parsedDate = date ? parseISO(date) : new Date();
  const formattedDate = format(parsedDate, "eeee dd MMMM yyyy", { locale: fr });

  const soutenancesForDay = allSoutenances
    .filter((s) => s.date_heure && isSameDay(new Date(s.date_heure), parsedDate))
    .sort(
      (a, b) =>
        new Date(a.date_heure!).getTime() - new Date(b.date_heure!).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/soutenances")}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au calendrier
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Planning du {formattedDate}
        </h1>
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
                {soutenancesForDay.length > 0 ? (
                  soutenancesForDay.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/soutenances/${s.id}`)}
                    >
                      <TableCell className="font-mono font-medium">
                        {format(new Date(s.date_heure!), "HH:mm")}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {s.dossier.candidat.user.first_name}{" "}
                        {s.dossier.candidat.user.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">
                        {s.dossier.titre_memoire}
                      </TableCell>
                      <TableCell>{s.salle?.nom || "—"}</TableCell>
                      <TableCell>{s.jury?.nom || "—"}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={s.statut as SoutenanceStatus} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucune soutenance pour cette date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
