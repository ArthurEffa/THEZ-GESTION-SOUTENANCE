
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import salleService, { Salle } from "@/services/salleService";
import sallesHeroImage from "@/assets/illustrations/salles-hero.png";

export default function SallesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDisponible, setFilterDisponible] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; salle: Salle | null }>({ open: false, salle: null });

  const { data: salles = [], isLoading, error } = useQuery<Salle[]>({ 
    queryKey: ['salles'],
    queryFn: () => salleService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salleService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salles'] });
      toast.success("Salle supprimée avec succès");
      setDeleteDialog({ open: false, salle: null });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredSalles = salles.filter((salle) => {
    const searchMatch = salle.nom.toLowerCase().includes(searchQuery.toLowerCase()) || salle.batiment.toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch = filterDisponible === "all" || (filterDisponible === "disponible" ? salle.est_disponible : !salle.est_disponible);
    return searchMatch && filterMatch;
  });

  const handleDelete = () => {
    if (deleteDialog.salle) deleteMutation.mutate(deleteDialog.salle.id);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-10"><p className="text-destructive">Erreur de chargement.</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Salles de soutenance</h1>
            <p className="text-muted-foreground text-sm">Gérez les salles disponibles pour les soutenances.</p>
          </div>
          <img src={sallesHeroImage} alt="Gestion des salles" className="w-32 h-auto hidden md:block"/>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Rechercher par nom ou bâtiment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={filterDisponible} onValueChange={setFilterDisponible}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Disponibilité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="disponible">Disponibles</SelectItem>
                            <SelectItem value="indisponible">Indisponibles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => navigate("/salles/nouveau")}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une salle
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Bâtiment</TableHead>
                            <TableHead className="text-center">Capacité</TableHead>
                            <TableHead>Disponibilité</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSalles.length > 0 ? filteredSalles.map((salle) => (
                            <TableRow key={salle.id} onClick={() => navigate(`/salles/${salle.id}`)} className="cursor-pointer">
                                <TableCell className="font-medium">{salle.nom}</TableCell>
                                <TableCell>{salle.batiment}</TableCell>
                                <TableCell className="text-center">{salle.capacite}</TableCell>
                                <TableCell>
                                    <Badge variant={salle.est_disponible ? "default" : "secondary"} className="gap-1">
                                        {salle.est_disponible ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 
                                        {salle.est_disponible ? "Disponible" : "Indisponible"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/salles/${salle.id}/modifier`); }}>Modifier</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, salle }); }} className="text-destructive">Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucune salle trouvée.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, salle: null })}
        title="Supprimer la salle"
        description={`Êtes-vous sûr de vouloir supprimer la salle "${deleteDialog.salle?.nom}" ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
