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
    case "admin":
      return <Dashboard />;
    case "etudiant":
      return <EtudiantDashboard />;
    case "jury":
    case "encadreur":
      return <EnseignantDashboard />;
    default:
      return <Dashboard />;
  }
}
