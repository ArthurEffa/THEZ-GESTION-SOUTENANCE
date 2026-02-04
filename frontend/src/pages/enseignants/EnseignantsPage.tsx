import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EnseignantProfile, GRADE_ENSEIGNANT_LABELS } from "@/types/models";
import enseignantService from "@/services/enseignantService";
import enseignantHeroImage from "@/assets/illustrations/enseignant-hero.png";

export default function EnseignantsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    enseignant: EnseignantProfile | null;
  }>({ open: false, enseignant: null });

  const {
    data: enseignants = [],
    isLoading,
    error,
  } = useQuery<EnseignantProfile[]>({
    queryKey: ["enseignants"],
    queryFn: () => enseignantService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => enseignantService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      toast.success("Enseignant supprimé avec succès");
      setDeleteDialog({ open: false, enseignant: null });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredEnseignants = enseignants.filter((e) => {
    const matchesGrade = filterGrade === "all" || e.grade === filterGrade;
    const fullName = `${e.user.first_name} ${e.user.last_name}`.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      fullName.includes(searchQuery.toLowerCase()) ||
      e.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleDelete = () => {
    if (deleteDialog.enseignant) {
      deleteMutation.mutate(deleteDialog.enseignant.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erreur de chargement.</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["enseignants"] })
          }
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with image */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground text-sm">
            Gérez les enseignants et leurs affectations départementales.
          </p>
        </div>
        <img
          src={enseignantHeroImage}
          alt="Illustration des enseignants"
          className="w-32 h-auto hidden md:block"
        />
      </div>

      {/* Table Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les grades</SelectItem>
                  <SelectItem value="PROFESSEUR">Professeur</SelectItem>
                  <SelectItem value="MAITRE_CONF">Maître de Conférence</SelectItem>
                  <SelectItem value="CHARGE_COURS">Chargé de Cours</SelectItem>
                  <SelectItem value="ASSISTANT">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => navigate("/enseignants/nouveau")}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Départements</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnseignants.length > 0 ? (
                  filteredEnseignants.map((enseignant) => (
                    <TableRow
                      key={enseignant.id}
                      onClick={() => navigate(`/enseignants/${enseignant.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="font-medium">
                          {enseignant.user.first_name} {enseignant.user.last_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${enseignant.user.email}`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {enseignant.user.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {GRADE_ENSEIGNANT_LABELS[enseignant.grade]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {enseignant.departements.length > 0 ? (
                            enseignant.departements.map((dept) => (
                              <Badge
                                key={dept.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {dept.code}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Non assigné
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {enseignant.user.phone || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/enseignants/${enseignant.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/enseignants/${enseignant.id}/modifier`
                                );
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({
                                  open: true,
                                  enseignant,
                                });
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun enseignant trouvé.
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
        onOpenChange={(open) =>
          setDeleteDialog({ open, enseignant: null })
        }
        title="Supprimer l'enseignant"
        description={
          deleteDialog.enseignant
            ? `Êtes-vous sûr de vouloir supprimer "${deleteDialog.enseignant.user.first_name} ${deleteDialog.enseignant.user.last_name}" ? Cette action supprimera également l'utilisateur associé.`
            : ""
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
