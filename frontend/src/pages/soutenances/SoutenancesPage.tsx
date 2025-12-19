import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, List, Plus, Clock, Users, CheckCircle, TrendingUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, isPast, isToday, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import soutenancesHeroImage from "@/assets/illustrations/gestion-soutenances.png";

// --- FAKE DATA ---
const FAKE_SOUTENANCES = [
  { id: "1", date: addDays(new Date(), -2), candidat: "Marie Martin", memoire: "Développement d'une application IoT", statut: "TERMINEE", salle: "A101" },
  { id: "2", date: addDays(new Date(), -2), candidat: "Paul Dubois", memoire: "Conception d'un pont suspendu", statut: "TERMINEE", salle: "B204" },
  { id: "3", date: new Date(), candidat: "Sophie Lefebvre", memoire: "IA pour la santé", statut: "EN_COURS", salle: "A101" },
  { id: "4", date: addDays(new Date(), 1), candidat: "Lucas Bernard", memoire: "Systèmes embarqués automobiles", statut: "PLANIFIEE", salle: "C302" },
  { id: "5", date: addDays(new Date(), 1), candidat: "Emma Petit", memoire: "Robotique industrielle", statut: "PLANIFIEE", salle: "A101" },
  { id: "6", date: addDays(new Date(), 2), candidat: "Léa Garcia", memoire: "Réseaux 5G et télécommunications", statut: "PLANIFIEE", salle: "D401" },
];
const FAKE_SESSION_DAYS = Array.from({ length: 15 }, (_, i) => addDays(new Date(), i - 4));
const FAKE_KPIS = { total: 80, today: 1, completed: 35 };
// -----------------

const KpiItem = ({ value, label, icon: Icon }) => (
    <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><p><span className="font-bold">{value}</span> <span className="text-sm text-muted-foreground">{label}</span></p></div>
);

export default function SoutenancesPage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));

  const { soutenanceDays, dayCounts, firstSoutenanceDay } = useMemo(() => {
    const counts = FAKE_SOUTENANCES.reduce((acc, s) => {
        const dayKey = format(s.date, "yyyy-MM-dd");
        acc[dayKey] = (acc[dayKey] || 0) + 1;
        return acc;
    }, {});
    const firstDay = FAKE_SOUTENANCES.length > 0 ? startOfDay(FAKE_SOUTENANCES[0].date) : new Date();
    return { soutenanceDays: Object.keys(counts), dayCounts: counts, firstSoutenanceDay: firstDay };
  }, []);

  const soutenancesForSelectedDay = useMemo(() => FAKE_SOUTENANCES.filter(s => isSameDay(s.date, selectedDay)), [selectedDay]);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1"><h1 className="text-2xl font-bold tracking-tight">Planning des Soutenances</h1><p className="text-muted-foreground text-sm">Visualisez et gérez le calendrier des soutenances.</p></div>
            <img src={soutenancesHeroImage} alt="Gestion des soutenances" className="w-32 h-auto hidden md:block"/>
        </div>

        <Tabs defaultValue="period">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <TabsList>
                    <TabsTrigger value="period"><Calendar className="h-4 w-4 mr-2"/>Période</TabsTrigger>
                    <TabsTrigger value="list"><List className="h-4 w-4 mr-2"/>Liste</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <Select><SelectTrigger className="w-[180px]"><SelectValue placeholder="Toutes les sessions" /></SelectTrigger><SelectContent><SelectItem value="s1">Session Master 2024</SelectItem></SelectContent></Select>
                    <Button onClick={() => navigate("/soutenances/nouveau")}><Plus className="mr-2 h-4 w-4"/> Planifier</Button>
                </div>
            </div>

            <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/50 mb-6">
                <KpiItem value={FAKE_KPIS.total} label="planifiées" icon={Calendar} />
                <KpiItem value={FAKE_KPIS.today} label="aujourd'hui" icon={Clock} />
                <KpiItem value={FAKE_KPIS.completed} label="terminées" icon={CheckCircle} />
                <KpiItem value={`${Math.round((FAKE_KPIS.completed/FAKE_KPIS.total)*100)}%`} label="d'avancement" icon={TrendingUp} />
            </div>

            <TabsContent value="period" className="space-y-6">
                <div className="p-1 border rounded-lg">
                    <div className="grid grid-cols-7 md:grid-cols-10 gap-1">
                        {FAKE_SESSION_DAYS.map(day => {
                            const dayStr = format(day, "yyyy-MM-dd");
                            const hasSoutenance = soutenanceDays.includes(dayStr);
                            const isSelected = isSameDay(day, selectedDay);
                            const isDayPast = isPast(day) && !isToday(day);
                            return (
                                <Button key={dayStr} variant="outline" className={cn("h-16 flex-col gap-1", !hasSoutenance && "pointer-events-none bg-muted/30", isSelected && "ring-2 ring-primary", isDayPast && hasSoutenance && "bg-red-100 text-red-900 hover:bg-red-200", isToday(day) && "bg-green-200 text-green-900 border-green-300 hover:bg-green-300", hasSoutenance && !isDayPast && !isToday(day) && "bg-blue-100 text-blue-900 hover:bg-blue-200")} onClick={() => hasSoutenance && setSelectedDay(day)}>
                                    <span className="text-xs font-normal opacity-70">{format(day, "E", { locale: fr })}</span>
                                    <span className="font-bold text-lg">{format(day, "dd")}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
                {soutenancesForSelectedDay.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">Planning du {format(selectedDay, "eeee dd MMMM", { locale: fr })}</h2>
                            <Table>
                                <TableHeader><TableRow><TableHead className="w-24">Heure</TableHead><TableHead>Candidat</TableHead><TableHead>Mémoire</TableHead><TableHead className="text-right">Statut</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {soutenancesForSelectedDay.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-mono">{format(s.date, "HH:mm")}</TableCell>
                                            <TableCell className="font-medium">{s.candidat}</TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-xs">{s.memoire}</TableCell>
                                            <TableCell className="text-right"><Badge>{s.statut}</Badge></TableCell>
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
                               <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Candidat</TableHead><TableHead>Salle</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                               <TableBody>{FAKE_SOUTENANCES.map(s => (<TableRow key={s.id}><TableCell>{format(s.date, "dd/MM/yy HH:mm")}</TableCell><TableCell>{s.candidat}</TableCell><TableCell>{s.salle}</TableCell><TableCell><Badge>{s.statut}</Badge></TableCell></TableRow>))}</TableBody>
                           </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
