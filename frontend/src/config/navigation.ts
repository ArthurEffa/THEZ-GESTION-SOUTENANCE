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
    roles: ["admin", "etudiant", "jury", "encadreur"],
  },

  // === ADMIN UNIQUEMENT ===
  {
    title: "Filières",
    url: "/filieres",
    icon: GraduationCap,
    roles: ["admin"],
  },
  {
    title: "Salles",
    url: "/salles",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Jurys",
    url: "/jurys",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    title: "Étudiants",
    url: "/etudiants",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Soutenances",
    url: "/soutenances",
    icon: Calendar,
    roles: ["admin"],
  },

  // === ÉTUDIANT ===
  {
    title: "Mon dossier",
    url: "/mon-dossier",
    icon: FolderOpen,
    roles: ["etudiant"],
  },
  {
    title: "Ma soutenance",
    url: "/ma-soutenance",
    icon: ClipboardList,
    roles: ["etudiant"],
  },

  // === JURY / ENCADREUR ===
  {
    title: "Mes étudiants",
    url: "/mes-etudiants",
    icon: Users,
    roles: ["jury", "encadreur"],
  },
  {
    title: "Mes soutenances",
    url: "/mes-soutenances",
    icon: Calendar,
    roles: ["jury", "encadreur"],
  },
  {
    title: "Mémoires",
    url: "/memoires",
    icon: FileText,
    roles: ["jury", "encadreur"],
  },
];

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationItems.filter(item => item.roles.includes(role));
}
