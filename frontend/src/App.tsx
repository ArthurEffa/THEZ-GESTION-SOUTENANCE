import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages communes
import Login from "@/pages/Login";
import DashboardRouter from "@/pages/DashboardRouter";
import NotFound from "@/pages/NotFound";

// Pages Admin
import FilieresPage from "@/pages/filieres/FilieresPage";
import FiliereFormPage from "@/pages/filieres/FiliereFormPage";
import SallesPage from "@/pages/salles/SallesPage";
import SalleFormPage from "@/pages/salles/SalleFormPage";
import JurysPage from "@/pages/jurys/JurysPage";
import JuryFormPage from "@/pages/jurys/JuryFormPage";
import EtudiantsPage from "@/pages/etudiants/EtudiantsPage";
import EtudiantFormPage from "@/pages/etudiants/EtudiantFormPage";
import EnseignantFormPage from "@/pages/enseignants/EnseignantFormPage";
import SessionFormPage from "@/pages/sessions/SessionFormPage";
import SoutenancesPage from "@/pages/soutenances/SoutenancesPage";
import SoutenanceFormPage from "@/pages/soutenances/SoutenanceFormPage";
import SoutenanceDetailPage from "@/pages/soutenances/SoutenanceDetailPage";

// Pages Étudiant
import MonDossierPage from "@/pages/etudiant/MonDossierPage";
import MaSoutenancePage from "@/pages/etudiant/MaSoutenancePage";

// Pages Enseignant (Jury / Encadreur)
import MesEtudiantsPage from "@/pages/enseignant/MesEtudiantsPage";
import MesSoutenancesPage from "@/pages/enseignant/MesSoutenancesPage";
import MemoiresPage from "@/pages/enseignant/MemoiresPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />

      {/* Protected Routes - Layout commun */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard adapté au rôle */}
        <Route path="/" element={<DashboardRouter />} />
        
        {/* === ROUTES ADMIN UNIQUEMENT === */}
        <Route path="/filieres" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FilieresPage />
          </ProtectedRoute>
        } />
        <Route path="/filieres/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FiliereFormPage />
          </ProtectedRoute>
        } />
        <Route path="/filieres/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FiliereFormPage />
          </ProtectedRoute>
        } />
        <Route path="/filieres/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FiliereFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/salles" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SallesPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/jurys" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JurysPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/etudiants" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EtudiantsPage />
          </ProtectedRoute>
        } />
        <Route path="/etudiants/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EtudiantFormPage />
          </ProtectedRoute>
        } />
        <Route path="/etudiants/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EtudiantFormPage />
          </ProtectedRoute>
        } />
        <Route path="/etudiants/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EtudiantFormPage />
          </ProtectedRoute>
        } />

        {/* Enseignants */}
        <Route path="/enseignants/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EnseignantFormPage />
          </ProtectedRoute>
        } />
        <Route path="/enseignants/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EnseignantFormPage />
          </ProtectedRoute>
        } />

        {/* Sessions */}
        <Route path="/sessions/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SessionFormPage />
          </ProtectedRoute>
        } />
        <Route path="/sessions/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SessionFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/soutenances" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SoutenancesPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/nouveau" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SoutenanceFormPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SoutenanceDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/:id/modifier" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SoutenanceFormPage />
          </ProtectedRoute>
        } />

        {/* === ROUTES ÉTUDIANT === */}
        <Route path="/mon-dossier" element={
          <ProtectedRoute allowedRoles={["etudiant"]}>
            <MonDossierPage />
          </ProtectedRoute>
        } />
        <Route path="/ma-soutenance" element={
          <ProtectedRoute allowedRoles={["etudiant"]}>
            <MaSoutenancePage />
          </ProtectedRoute>
        } />

        {/* === ROUTES JURY / ENCADREUR === */}
        <Route path="/mes-etudiants" element={
          <ProtectedRoute allowedRoles={["jury", "encadreur"]}>
            <MesEtudiantsPage />
          </ProtectedRoute>
        } />
        <Route path="/mes-soutenances" element={
          <ProtectedRoute allowedRoles={["jury", "encadreur"]}>
            <MesSoutenancesPage />
          </ProtectedRoute>
        } />
        <Route path="/memoires" element={
          <ProtectedRoute allowedRoles={["jury", "encadreur"]}>
            <MemoiresPage />
          </ProtectedRoute>
        } />
        <Route path="/memoires/:id" element={
          <ProtectedRoute allowedRoles={["jury", "encadreur"]}>
            <MemoiresPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
