import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CandidatProfile, CYCLE_LABELS, Departement } from "@/types/models";
import candidatService from "@/services/candidatService";
import departementService from "@/services/departementService";
import candidatsHeroImage from "@/assets/illustrations/etudiants-hero.png";

export default function CandidatsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartement, setFilterDepartement] = useState<string>("all");
  const [filterCycle, setFilterCycle] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; candidat: CandidatProfile | null }>({ open: false, candidat: null });

  const { data: candidats = [], isLoading: isLoadingCandidats } = useQuery<CandidatProfile[]>({ 
    queryKey: ['candidats'],
    queryFn: () => candidatService.getAll(),
  });

  const { data: departements = [] } = useQuery<Departement[]>({ 
    queryKey: ['departements'],
    queryFn: () => departementService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => candidatService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['candidats'] });
      toast.success("Candidat supprimé avec succès");
      setDeleteDialog({ open: false, candidat: null });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredCandidats = candidats.filter((candidat) => {
    const searchMatch = candidat.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        candidat.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        candidat.matricule.toLowerCase().includes(searchQuery.toLowerCase());
    const departementMatch = filterDepartement === "all" || candidat.departement?.id === filterDepartement;
    const cycleMatch = filterCycle === "all" || candidat.cycle === filterCycle;
    return searchMatch && departementMatch && cycleMatch;
  });

  const handleDelete = () => {
    if (deleteDialog.candidat) deleteMutation.mutate(deleteDialog.candidat.id);
  };

  if (isLoadingCandidats) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Candidats</h1>
            <p className="text-muted-foreground text-sm">Gérez les profils des candidats aux soutenances.</p>
          </div>
          <img src={candidatsHeroImage} alt="Gestion des candidats" className="w-32 h-auto hidden md:block"/>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <Input
                    placeholder="Rechercher par nom, prénom ou matricule..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <Select value={filterDepartement} onValueChange={setFilterDepartement}>
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Département" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les départements</SelectItem>
                            {departements.map(d => <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterCycle} onValueChange={setFilterCycle}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Cycle" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les cycles</SelectItem>
                            <SelectItem value="INGENIEUR">Ingénieur</SelectItem>
                            <SelectItem value="SCIENCE_INGENIEUR">Science de l'ingénieur</SelectItem>
                            <SelectItem value="MASTER_PRO">Master professionnel</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => navigate("/candidats/nouveau")}>
                      <Plus className="mr-2 h-4 w-4" /> Ajouter
                    </Button>
                </div>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom Complet</TableHead>
                            <TableHead>Département</TableHead>
                            <TableHead>Cycle</TableHead>
                            <TableHead>Dossier</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCandidats.length > 0 ? filteredCandidats.map((candidat) => (
                            <TableRow key={candidat.id} onClick={() => navigate(`/candidats/${candidat.id}`)} className="cursor-pointer">
                                <TableCell>
                                    <div className="font-medium">{candidat.user.first_name} {candidat.user.last_name}</div>
                                    <div className="text-xs text-muted-foreground">{candidat.matricule}</div>
                                </TableCell>
                                <TableCell>{candidat.departement?.nom || "-"}</TableCell>
                                <TableCell><Badge variant="outline">{CYCLE_LABELS[candidat.cycle]}</Badge></TableCell>
                                <TableCell><Badge variant={candidat.has_dossier ? "default" : "secondary"}>{candidat.has_dossier ? "Oui" : "Non"}</Badge></TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/candidats/${candidat.id}/modifier`); }}>Modifier</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, candidat }); }} className="text-destructive">Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun candidat trouvé.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, candidat: null })}
        title="Supprimer le candidat"
        description={
          deleteDialog.candidat ? `Êtes-vous sûr de vouloir supprimer "${deleteDialog.candidat.user.first_name} ${deleteDialog.candidat.user.last_name}"? Cette action est irréversible.` : ""
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
