import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoutenanceStatus } from "@/components/common/StatusBadge";
import { getDepartmentColor } from "@/config/departments";

interface Soutenance {
  id: string;
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  etudiant: string;
  filiere: string;
  salle: string;
  jury: string;
  status: SoutenanceStatus;
}

interface SoutenanceCalendarProps {
  soutenances: Soutenance[];
  onSoutenanceClick?: (soutenance: Soutenance) => void;
}

const statusDot: Record<SoutenanceStatus, string> = {
  PLANIFIEE: "bg-success",
  EN_COURS: "bg-warning",
  TERMINEE: "bg-info",
  ANNULEE: "bg-destructive",
};

// Helper to parse DD/MM/YYYY format
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateKey = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  // Adjust to Monday
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + diff);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const fullDayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function SoutenanceCalendar({ soutenances, onSoutenanceClick }: SoutenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFiliere, setSelectedFiliere] = useState<string>("all");
  
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  
  const filieres = useMemo(() => {
    const unique = [...new Set(soutenances.map(s => s.filiere))];
    return unique.sort();
  }, [soutenances]);
  
  const filteredSoutenances = useMemo(() => {
    if (selectedFiliere === "all") return soutenances;
    return soutenances.filter(s => s.filiere === selectedFiliere);
  }, [soutenances, selectedFiliere]);
  
  const soutenancesByDate = useMemo(() => {
    const map: Record<string, Soutenance[]> = {};
    filteredSoutenances.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    // Sort by time
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
    });
    return map;
  }, [filteredSoutenances]);
  
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const formatMonthYear = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    return currentDate.toLocaleDateString("fr-FR", options);
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-2 text-lg font-semibold capitalize">
              {formatMonthYear()}
            </span>
          </div>
          
          {/* Filter by filiere */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filière:</span>
            <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes les filières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les filières</SelectItem>
                {filieres.map(f => (
                  <SelectItem key={f} value={f}>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", getDepartmentColor(f).bg.replace("/10", ""))} />
                      {f}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t mt-4">
          {filieres.map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs">
              <span className={cn("h-2 w-2 rounded-sm", getDepartmentColor(f).bg.replace("/10", ""))} />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-t">
          {/* Header row */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "border-r last:border-r-0 p-2 text-center",
                isToday(day) && "bg-primary/5"
              )}
            >
              <div className="text-xs text-muted-foreground">{dayNames[index]}</div>
              <div className={cn(
                "text-lg font-semibold mt-1",
                isToday(day) && "text-primary"
              )}>
                {day.getDate()}
              </div>
            </div>
          ))}
          
          {/* Content row */}
          {weekDays.map((day, index) => {
            const dateKey = formatDateKey(day);
            const daySoutenances = soutenancesByDate[dateKey] || [];
            
            return (
              <div
                key={`content-${index}`}
                className={cn(
                  "border-r border-t last:border-r-0 min-h-[200px] p-1",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="space-y-1">
                  {daySoutenances.map(soutenance => {
                    const color = getDepartmentColor(soutenance.filiere);
                    return (
                      <div
                        key={soutenance.id}
                        onClick={() => onSoutenanceClick?.(soutenance)}
                        className={cn(
                          "p-2 rounded-md border-l-2 cursor-pointer transition-all hover:shadow-md",
                          color.bg,
                          color.border
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[soutenance.status])} />
                          <span className="text-xs font-medium text-muted-foreground">
                            {soutenance.heureDebut}
                          </span>
                        </div>
                        <p className={cn("text-sm font-medium truncate", color.text)}>
                          {soutenance.etudiant}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {soutenance.salle}
                        </p>
                      </div>
                    );
                  })}
                  
                  {daySoutenances.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 py-8">
                      -
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
