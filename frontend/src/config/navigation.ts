import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Users,
  UserCheck,
  Calendar,
  FileText,
  FolderOpen,
  ClipboardList,
  CalendarClock,
  LucideIcon
} from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[]; // Roles autorisés à voir ce menu
}

export const navigationItems: NavigationItem[] = [
  // === COMMUN À TOUS ===
  {
    title: "Tableau de bord",
    url: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CANDIDAT", "ENSEIGNANT"],
  },

  // === ADMIN UNIQUEMENT ===
  {
    title: "Départements",
    url: "/departements",
    icon: GraduationCap,
    roles: ["ADMIN"],
  },
  {
    title: "Salles",
    url: "/salles",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    title: "Enseignants",
    url: "/enseignants",
    icon: UserCheck,
    roles: ["ADMIN"],
  },
  {
    title: "Candidats",
    url: "/candidats",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Sessions",
    url: "/sessions",
    icon: CalendarClock,
    roles: ["ADMIN"],
  },
  {
    title: "Soutenances",
    url: "/soutenances",
    icon: Calendar,
    roles: ["ADMIN"],
  },

  // === CANDIDAT ===
  {
    title: "Mon dossier",
    url: "/mon-dossier",
    icon: FolderOpen,
    roles: ["CANDIDAT"],
  },
  {
    title: "Ma soutenance",
    url: "/ma-soutenance",
    icon: ClipboardList,
    roles: ["CANDIDAT"],
  },

  // === ENSEIGNANT ===
  {
    title: "Mes candidats",
    url: "/mes-candidats",
    icon: Users,
    roles: ["ENSEIGNANT"],
  },
  {
    title: "Mes soutenances",
    url: "/mes-soutenances",
    icon: Calendar,
    roles: ["ENSEIGNANT"],
  },
  {
    title: "Mémoires",
    url: "/memoires",
    icon: FileText,
    roles: ["ENSEIGNANT"],
  },
];

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationItems.filter(item => item.roles.includes(role));
}
