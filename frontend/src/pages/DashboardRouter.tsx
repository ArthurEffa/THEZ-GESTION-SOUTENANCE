import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./Dashboard";
import CandidatDashboard from "./candidat/CandidatDashboard";
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
      return <CandidatDashboard />;
    case "ENSEIGNANT":
      return <EnseignantDashboard />;
    default:
      return <Dashboard />;
  }
}
