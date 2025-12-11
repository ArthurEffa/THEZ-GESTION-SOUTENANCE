import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SoutenanceStatus = "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";

interface StatusBadgeProps {
  status: SoutenanceStatus;
  className?: string;
}

const statusConfig: Record<SoutenanceStatus, { label: string; className: string; dotClassName: string }> = {
  PLANIFIEE: {
    label: "Planifiée",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
    dotClassName: "bg-success",
  },
  EN_COURS: {
    label: "En cours",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    dotClassName: "bg-warning",
  },
  TERMINEE: {
    label: "Terminée",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
    dotClassName: "bg-info",
  },
  ANNULEE: {
    label: "Annulée",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    dotClassName: "bg-destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border",
        config.className,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full mr-1.5", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
