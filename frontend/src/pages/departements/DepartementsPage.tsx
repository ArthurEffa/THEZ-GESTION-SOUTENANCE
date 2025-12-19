
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
import departementService, { Departement } from "@/services/departementService";
import departmentsHeroImage from "@/assets/illustrations/departments-hero.png";

export default function DepartementsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; departement: Departement | null }>({ open: false, departement: null });

  const { data: departements = [], isLoading, error } = useQuery<Departement[]>({ 
    queryKey: ['departements'],
    queryFn: () => departementService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departementService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departements'] });
      toast.success(`Département supprimé avec succès`);
      setDeleteDialog({ open: false, departement: null });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredDepartements = departements.filter(
    (f) =>
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteDialog.departement) {
      deleteMutation.mutate(deleteDialog.departement.id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erreur de chargement.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['departements'] })} className="mt-4">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with image (more compact) */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Départements</h1>
            <p className="text-muted-foreground text-sm">
              Gérez les départements académiques de l'établissement.
            </p>
          </div>
          <img 
            src={departmentsHeroImage} 
            alt="Illustration des départements"
            className="w-32 h-auto hidden md:block"
          />
      </div>

      {/* Table Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Input
                placeholder="Rechercher par nom ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
            />
            <Button onClick={() => navigate("/departements/nouveau")}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du département</TableHead>
                  <TableHead className="text-center">Candidats</TableHead>
                  <TableHead className="text-center">Enseignants</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartements.length > 0 ? (
                  filteredDepartements.map((departement) => (
                    <TableRow 
                      key={departement.id} 
                      onClick={() => navigate(`/departements/${departement.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium">{departement.nom}</div>
                        <div className="text-xs text-muted-foreground">{departement.code}</div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{departement.nb_candidats}</TableCell>
                      <TableCell className="text-center font-medium">{departement.nb_enseignants}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/departements/${departement.id}/modifier`); }}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, departement }); }} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Aucun département trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, departement: null })}
        title="Supprimer le département"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.departement?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
