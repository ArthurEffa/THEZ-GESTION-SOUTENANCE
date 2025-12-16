import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./Dashboard";
import EtudiantDashboard from "./etudiant/EtudiantDashboard";
import EnseignantDashboard from "./enseignant/EnseignantDashboard";

/**
 * Composant qui affiche le dashboard approprié selon le rôle de l'utilisateur
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <Dashboard />;
    case "CANDIDAT":
      return <EtudiantDashboard />;
    case "ENSEIGNANT":
      return <EnseignantDashboard />;
    default:
      return <Dashboard />;
  }
}
