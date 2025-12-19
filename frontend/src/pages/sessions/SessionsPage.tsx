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
import { Loader2, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; session: SessionSoutenance | null }>({ open: false, session: null });

  const { data: sessions = [], isLoading, error } = useQuery<SessionSoutenance[]>({ 
    queryKey: ['sessions'],
    queryFn: () => sessionService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success("Session supprimée avec succès");
      setDeleteDialog({ open: false, session: null });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredSessions = sessions.filter(
    (session) =>
      session.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.annee_academique.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.session) deleteMutation.mutate(deleteDialog.session.id);
  };

  const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A";
      try {
        // Essayer de parser la date comme une chaîne ISO 8601, puis formater.
        const date = parseISO(dateString);
        return format(date, "dd MMM yyyy", { locale: fr });
      } catch (error) {
        // Si ça échoue, retourner la chaîne originale (ou un message d'erreur)
        console.error("Invalid date format:", dateString);
        return "Date invalide";
      }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-10"><p className="text-destructive">Erreur de chargement.</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Sessions de soutenance</h1>
            <p className="text-muted-foreground text-sm">Gérez les sessions de soutenance par année académique.</p>
          </div>
          <img src={sessionHeroImage} alt="Gestion des sessions" className="w-32 h-auto hidden md:block"/>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4 gap-4">
                <Input
                    placeholder="Rechercher par titre ou année..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={() => navigate("/sessions/nouveau")}>
                  <Plus className="mr-2 h-4 w-4" /> Créer une session
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Statistiques</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                            <TableRow key={session.id} onClick={() => navigate(`/sessions/${session.id}`)} className="cursor-pointer">
                                <TableCell>
                                    <div className="font-medium">{session.titre}</div>
                                    <div className="text-xs text-muted-foreground">{session.annee_academique} - {session.niveau_concerne}</div>
                                </TableCell>
                                <TableCell>{formatDate(session.date_ouverture)} - {formatDate(session.date_cloture)}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{session.nb_dossiers || 0} dossiers</div>
                                    <div className="text-xs text-muted-foreground">{session.nb_soutenances || 0} soutenances</div>
                                </TableCell>
                                <TableCell><Badge variant="outline" className={STATUT_COLORS[session.statut]}>{STATUT_SESSION_LABELS[session.statut]}</Badge></TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/sessions/${session.id}/modifier`); }}>Modifier</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, session }); }} className="text-destructive">Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucune session trouvée.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, session: null })}
        title="Supprimer la session"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.session?.titre}" ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
