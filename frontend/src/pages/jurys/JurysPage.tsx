
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import juryService from "@/services/juryService";
import { Jury, STATUT_JURY_LABELS, StatutJury } from "@/types/models";
import { Loader2, Users, Award, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import juryHeroImage from "@/assets/illustrations/jurys-hero.png";

interface JuryInList extends Omit<Jury, 'session' | 'composition'> {
  session_titre: string;
  nb_membres: number;
  president: string | null;
}

const STATUT_COLORS: Record<StatutJury, string> = {
  PROPOSE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  VALIDE: "bg-green-100 text-green-800 border-green-200",
  ACTIF: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function JurysPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jury: JuryInList | null }>({ open: false, jury: null });

  const { data: jurys = [], isLoading, error } = useQuery<JuryInList[]>({ 
    queryKey: ['jurys'],
    queryFn: () => juryService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => juryService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['jurys'] });
      toast.success(`Jury supprimé avec succès`);
      setDeleteDialog({ open: false, jury: null });
    },
    onError: () => toast.error("Erreur de suppression"),
  });

  const validerMutation = useMutation({
    mutationFn: (id: string) => juryService.valider(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jurys'] }),
  });

  const activerMutation = useMutation({
    mutationFn: (id: string) => juryService.activer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jurys'] }),
  });

  const filteredJurys = jurys.filter(
    (jury) =>
      jury.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jury.session_titre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.jury) deleteMutation.mutate(deleteDialog.jury.id);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-10"><p className="text-destructive">Erreur de chargement.</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Jurys de soutenance</h1>
            <p className="text-muted-foreground text-sm">Composez et gérez les jurys pour les soutenances.</p>
          </div>
          <img src={juryHeroImage} alt="Gestion des jurys" className="w-32 h-auto hidden md:block"/>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4 gap-4">
                <Input
                    placeholder="Rechercher un jury..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={() => navigate("/jurys/nouveau")}>
                  <Plus className="mr-2 h-4 w-4" /> Composer un jury
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom du Jury</TableHead>
                            <TableHead>Président</TableHead>
                            <TableHead className="text-center">Membres</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredJurys.length > 0 ? filteredJurys.map((jury) => (
                            <TableRow key={jury.id} onClick={() => navigate(`/jurys/${jury.id}`)} className="cursor-pointer">
                                <TableCell>
                                    <div className="font-medium">{jury.nom}</div>
                                    <div className="text-xs text-muted-foreground">{jury.session_titre}</div>
                                </TableCell>
                                <TableCell>{jury.president || "-"}</TableCell>
                                <TableCell className="text-center">{jury.nb_membres}</TableCell>
                                <TableCell><Badge variant="outline" className={STATUT_COLORS[jury.statut]}>{STATUT_JURY_LABELS[jury.statut]}</Badge></TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {jury.statut === 'PROPOSE' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); validerMutation.mutate(jury.id); }}>Valider</DropdownMenuItem>}
                                            {jury.statut === 'VALIDE' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); activerMutation.mutate(jury.id); }}>Activer</DropdownMenuItem>}
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/jurys/${jury.id}/modifier`); }}>Modifier</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, jury }); }} className="text-destructive">Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun jury trouvé.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, jury: null })}
        title="Supprimer le jury"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.jury?.nom}" ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
