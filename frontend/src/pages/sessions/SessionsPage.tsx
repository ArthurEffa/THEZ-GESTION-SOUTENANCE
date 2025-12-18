import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import sessionService from "@/services/sessionService";
import { SessionSoutenance, STATUT_SESSION_LABELS, StatutSession } from "@/types/models";
import { Loader2, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import sessionHeroImage from "@/assets/illustrations/gestion-session-hero.png";

const STATUT_COLORS: Record<StatutSession, string> = {
  OUVERT: "bg-green-100 text-green-800 border-green-200",
  EN_COURS: "bg-blue-100 text-blue-800 border-blue-200",
  FERME: "bg-gray-100 text-gray-800 border-gray-200",
  TERMINE: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function SessionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; session: SessionSoutenance | null }>({
    open: false,
    session: null,
  });

  // Récupération des sessions depuis l'API
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionService.getAll(),
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success(`Session supprimée avec succès`);
      setDeleteDialog({ open: false, session: null });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la session");
    },
  });

  const filteredSessions = sessions.filter(
    (session) =>
      session.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.annee_academique.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.niveau_concerne.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.session) {
      deleteMutation.mutate(deleteDialog.session.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Erreur lors du chargement des sessions</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['sessions'] })}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sessions de soutenance</h1>
          <p className="text-muted-foreground">
            Gérez les sessions de soutenance par année académique
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/sessions/nouveau")}
          >
            Créer une session
          </Button>
        </div>
        <div className="w-full lg:w-72 h-48 flex items-center justify-center">
          <img
            src={sessionHeroImage}
            alt="Illustration gestion des sessions"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Rechercher une session..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Grid de sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <Card
            key={session.id}
            className="group hover:shadow-md transition-shadow cursor-pointer border-border/60"
            onClick={() => navigate(`/sessions/${session.id}`)}
          >
            <CardContent className="p-0">
              {/* Header avec badge statut */}
              <div className="p-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-tight flex-1">
                    {session.titre}
                  </h3>
                  <Badge
                    variant="outline"
                    className={STATUT_COLORS[session.statut]}
                  >
                    {STATUT_SESSION_LABELS[session.statut]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{session.annee_academique}</span>
                  <span>•</span>
                  <span>{session.niveau_concerne}</span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Du {formatDate(session.date_ouverture)} au {formatDate(session.date_cloture)}
                    </span>
                  </div>
                  {session.description && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{session.description}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{session.nb_dossiers || 0} dossiers</span>
                    <span>{session.nb_soutenances || 0} soutenances</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sessions/${session.id}/modifier`);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, session });
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune session trouvée
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, session: null })}
        title="Supprimer la session"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.session?.titre}" ? Cette action est irréversible et supprimera toutes les données associées.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
