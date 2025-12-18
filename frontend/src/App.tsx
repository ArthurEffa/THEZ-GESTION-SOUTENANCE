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
import DepartementsPage from "@/pages/departements/DepartementsPage";
import DepartementFormPage from "@/pages/departements/DepartementFormPage";
import SallesPage from "@/pages/salles/SallesPage";
import SalleFormPage from "@/pages/salles/SalleFormPage";
import EnseignantsPage from "@/pages/enseignants/EnseignantsPage";
import EnseignantFormPage from "@/pages/enseignants/EnseignantFormPage";
import CandidatsPage from "@/pages/candidats/CandidatsPage";
import CandidatFormPage from "@/pages/candidats/CandidatFormPage";
import SessionsPage from "@/pages/sessions/SessionsPage";
import SessionFormPage from "@/pages/sessions/SessionFormPage";
import JurysPage from "@/pages/jurys/JurysPage";
import JuryFormPage from "@/pages/jurys/JuryFormPage";
import SoutenancesPage from "@/pages/soutenances/SoutenancesPage";
import SoutenanceFormPage from "@/pages/soutenances/SoutenanceFormPage";
import SoutenanceDetailPage from "@/pages/soutenances/SoutenanceDetailPage";

// Pages Candidat
import MonDossierPage from "@/pages/candidat/MonDossierPage";
import MaSoutenancePage from "@/pages/candidat/MaSoutenancePage";

// Pages Enseignant (Jury / Encadreur)
import MesCandidatsPage from "@/pages/enseignant/MesCandidatsPage";
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
        <Route path="/departements" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DepartementsPage />
          </ProtectedRoute>
        } />
        <Route path="/departements/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DepartementFormPage />
          </ProtectedRoute>
        } />
        <Route path="/departements/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DepartementFormPage />
          </ProtectedRoute>
        } />
        <Route path="/departements/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DepartementFormPage />
          </ProtectedRoute>
        } />

        <Route path="/salles" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SallesPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />
        <Route path="/salles/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SalleFormPage />
          </ProtectedRoute>
        } />

        <Route path="/enseignants" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <EnseignantsPage />
          </ProtectedRoute>
        } />
        <Route path="/enseignants/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <EnseignantFormPage />
          </ProtectedRoute>
        } />
        <Route path="/enseignants/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <EnseignantFormPage />
          </ProtectedRoute>
        } />
        <Route path="/enseignants/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <EnseignantFormPage />
          </ProtectedRoute>
        } />

        <Route path="/candidats" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CandidatsPage />
          </ProtectedRoute>
        } />
        <Route path="/candidats/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CandidatFormPage />
          </ProtectedRoute>
        } />
        <Route path="/candidats/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CandidatFormPage />
          </ProtectedRoute>
        } />
        <Route path="/candidats/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CandidatFormPage />
          </ProtectedRoute>
        } />

        {/* Sessions */}
        <Route path="/sessions" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SessionsPage />
          </ProtectedRoute>
        } />
        <Route path="/sessions/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SessionFormPage />
          </ProtectedRoute>
        } />
        <Route path="/sessions/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SessionFormPage />
          </ProtectedRoute>
        } />
        <Route path="/sessions/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SessionFormPage />
          </ProtectedRoute>
        } />

        {/* Jurys */}
        <Route path="/jurys" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <JurysPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />
        <Route path="/jurys/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <JuryFormPage />
          </ProtectedRoute>
        } />

        <Route path="/soutenances" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SoutenancesPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/nouveau" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SoutenanceFormPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/:id" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SoutenanceDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/soutenances/:id/modifier" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SoutenanceFormPage />
          </ProtectedRoute>
        } />

        {/* === ROUTES CANDIDAT === */}
        <Route path="/mon-dossier" element={
          <ProtectedRoute allowedRoles={["CANDIDAT"]}>
            <MonDossierPage />
          </ProtectedRoute>
        } />
        <Route path="/ma-soutenance" element={
          <ProtectedRoute allowedRoles={["CANDIDAT"]}>
            <MaSoutenancePage />
          </ProtectedRoute>
        } />

        {/* === ROUTES ENSEIGNANT === */}
        <Route path="/mes-candidats" element={
          <ProtectedRoute allowedRoles={["ENSEIGNANT"]}>
            <MesCandidatsPage />
          </ProtectedRoute>
        } />
        <Route path="/mes-soutenances" element={
          <ProtectedRoute allowedRoles={["ENSEIGNANT"]}>
            <MesSoutenancesPage />
          </ProtectedRoute>
        } />
        <Route path="/memoires" element={
          <ProtectedRoute allowedRoles={["ENSEIGNANT"]}>
            <MemoiresPage />
          </ProtectedRoute>
        } />
        <Route path="/memoires/:id" element={
          <ProtectedRoute allowedRoles={["ENSEIGNANT"]}>
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
