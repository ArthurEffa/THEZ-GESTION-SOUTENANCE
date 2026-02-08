import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, List, Plus, Clock, Users, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, isPast, isToday, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { STATUT_SOUTENANCE_LABELS, type Soutenance } from "@/types/models";
import { StatusBadge, type SoutenanceStatus } from "@/components/common/StatusBadge";
import soutenanceService from "@/services/soutenanceService";
import soutenancesHeroImage from "@/assets/illustrations/gestion-soutenances.png";

const KpiItem = ({ value, label, icon: Icon }: { value: string | number; label: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <p>
      <span className="font-bold">{value}</span>{" "}
      <span className="text-sm text-muted-foreground">{label}</span>
    </p>
  </div>
);

export default function SoutenancesPage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));

  const { data: soutenances = [], isLoading } = useQuery<Soutenance[]>({
    queryKey: ["soutenances"],
    queryFn: () => soutenanceService.getAll(),
  });

  // Soutenances avec date uniquement
  const soutenancesAvecDate = useMemo(
    () => soutenances.filter((s) => s.date_heure),
    [soutenances]
  );

  // Calcul des KPIs
  const kpis = useMemo(() => {
    const total = soutenances.length;
    const today = soutenancesAvecDate.filter((s) =>
      isToday(new Date(s.date_heure!))
    ).length;
    const completed = soutenances.filter(
      (s) => s.statut === "TERMINEE"
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, today, completed, pct };
  }, [soutenances, soutenancesAvecDate]);

  // Jours uniques qui ont des soutenances + comptage
  const { sessionDays, dayCounts, soutenanceDayKeys } = useMemo(() => {
    const counts: Record<string, number> = {};
    const daysSet = new Set<string>();

    soutenancesAvecDate.forEach((s) => {
      const dayKey = format(new Date(s.date_heure!), "yyyy-MM-dd");
      counts[dayKey] = (counts[dayKey] || 0) + 1;
      daysSet.add(dayKey);
    });

    // Générer une plage de jours autour des soutenances
    const allDays = Object.keys(counts).sort();
    let days: Date[] = [];
    if (allDays.length > 0) {
      const first = new Date(allDays[0]);
      const last = new Date(allDays[allDays.length - 1]);
      const cursor = new Date(first);
      while (cursor <= last) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return {
      sessionDays: days,
      dayCounts: counts,
      soutenanceDayKeys: Array.from(daysSet),
    };
  }, [soutenancesAvecDate]);

  // Soutenances pour le jour sélectionné
  const soutenancesForSelectedDay = useMemo(
    () =>
      soutenancesAvecDate
        .filter((s) => isSameDay(new Date(s.date_heure!), selectedDay))
        .sort(
          (a, b) =>
            new Date(a.date_heure!).getTime() -
            new Date(b.date_heure!).getTime()
        ),
    [soutenancesAvecDate, selectedDay]
  );

  // Liste complète triée par date
  const soutenancesTriees = useMemo(
    () =>
      [...soutenancesAvecDate].sort(
        (a, b) =>
          new Date(a.date_heure!).getTime() -
          new Date(b.date_heure!).getTime()
      ),
    [soutenancesAvecDate]
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
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Planning des Soutenances
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualisez et gérez le calendrier des soutenances.
          </p>
        </div>
        <img
          src={soutenancesHeroImage}
          alt="Gestion des soutenances"
          className="w-32 h-auto hidden md:block"
        />
      </div>

      <Tabs defaultValue="period">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="period">
              <Calendar className="h-4 w-4 mr-2" />
              Période
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Liste
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => navigate("/soutenances/nouveau")}>
            <Plus className="mr-2 h-4 w-4" /> Planifier
          </Button>
        </div>

        <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/50 mb-6">
          <KpiItem value={kpis.total} label="planifiées" icon={Calendar} />
          <KpiItem value={kpis.today} label="aujourd'hui" icon={Clock} />
          <KpiItem value={kpis.completed} label="terminées" icon={CheckCircle} />
          <KpiItem
            value={`${kpis.pct}%`}
            label="d'avancement"
            icon={TrendingUp}
          />
        </div>

        <TabsContent value="period" className="space-y-6">
          {sessionDays.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
              Aucune soutenance avec date planifiée
            </div>
          ) : (
            <div className="p-1 border rounded-lg">
              <div className="grid grid-cols-7 md:grid-cols-10 gap-1">
                {sessionDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const hasSoutenance = soutenanceDayKeys.includes(dayStr);
                  const isSelected = isSameDay(day, selectedDay);
                  const isDayPast = isPast(day) && !isToday(day);
                  return (
                    <Button
                      key={dayStr}
                      variant="outline"
                      className={cn(
                        "h-16 flex-col gap-1",
                        !hasSoutenance &&
                          "pointer-events-none bg-muted/30",
                        isSelected && "ring-2 ring-primary",
                        isDayPast &&
                          hasSoutenance &&
                          "bg-red-100 text-red-900 hover:bg-red-200",
                        isToday(day) &&
                          "bg-green-200 text-green-900 border-green-300 hover:bg-green-300",
                        hasSoutenance &&
                          !isDayPast &&
                          !isToday(day) &&
                          "bg-blue-100 text-blue-900 hover:bg-blue-200"
                      )}
                      onClick={() =>
                        hasSoutenance && setSelectedDay(day)
                      }
                    >
                      <span className="text-xs font-normal opacity-70">
                        {format(day, "E", { locale: fr })}
                      </span>
                      <span className="font-bold text-lg">
                        {format(day, "dd")}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {soutenancesForSelectedDay.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Planning du{" "}
                  {format(selectedDay, "eeee dd MMMM", { locale: fr })}
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Heure</TableHead>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Mémoire</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead className="text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soutenancesForSelectedDay.map((s) => (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/soutenances/${s.id}`)
                        }
                      >
                        <TableCell className="font-mono">
                          {format(new Date(s.date_heure!), "HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {s.dossier?.candidat_nom || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-xs">
                          {s.dossier?.titre_memoire || "-"}
                        </TableCell>
                        <TableCell>{s.salle?.nom || "—"}</TableCell>
                        <TableCell className="text-right">
                          <StatusBadge
                            status={s.statut as SoutenanceStatus}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Mémoire</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead className="text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soutenancesTriees.length > 0 ? (
                      soutenancesTriees.map((s) => (
                        <TableRow
                          key={s.id}
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/soutenances/${s.id}`)
                          }
                        >
                          <TableCell>
                            {format(
                              new Date(s.date_heure!),
                              "dd/MM/yy HH:mm"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {s.dossier.candidat.user.first_name}{" "}
                            {s.dossier.candidat.user.last_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate max-w-xs">
                            {s.dossier?.titre_memoire || "-"}
                          </TableCell>
                          <TableCell>{s.salle?.nom || "—"}</TableCell>
                          <TableCell className="text-right">
                            <StatusBadge
                              status={s.statut as SoutenanceStatus}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Aucune soutenance trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
