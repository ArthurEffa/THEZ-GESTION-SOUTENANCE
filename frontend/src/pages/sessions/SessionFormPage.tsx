import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import sessionService from "@/services/sessionService";
import { StatutSession, Cycle, STATUT_SESSION_LABELS, CYCLE_LABELS } from "@/types/models";

const STATUTS: StatutSession[] = ['OUVERT', 'FERME', 'EN_COURS', 'TERMINE'];
const CYCLES: Cycle[] = ['INGENIEUR', 'SCIENCE_INGENIEUR', 'MASTER_PRO'];

export default function SessionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titre: "", annee_academique: "", // Modifié ici
    date_ouverture: "", date_cloture: "",
    niveau_concerne: "" as Cycle | "",
    statut: "OUVERT" as StatutSession,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionService.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (session) {
      setFormData({
        titre: session.titre,
        annee_academique: session.annee_academique,
        date_ouverture: session.date_ouverture.slice(0, 16),
        date_cloture: session.date_cloture.slice(0, 16),
        niveau_concerne: session.niveau_concerne as Cycle,
        statut: session.statut,
        description: session.description || "",
      });
    }
  }, [session]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const submitData = { ...data, date_ouverture: new Date(data.date_ouverture).toISOString(), date_cloture: new Date(data.date_cloture).toISOString() };
      return isEditing ? sessionService.update(id!, submitData) : sessionService.create(submitData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if(isEditing) await queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      toast.success(isEditing ? "Session modifiée" : "Session créée");
      navigate("/sessions");
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Erreur de sauvegarde"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoadingSession) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/sessions")} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Modifier la session" : "Nouvelle session"}</h1>
        <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2"><Label htmlFor="titre">Titre</Label><Input id="titre" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Session Master Informatique..." /></div>
            <div className="space-y-2"><Label htmlFor="annee_academique">Année académique</Label><Input id="annee_academique" value={formData.annee_academique} onChange={e => setFormData({...formData, annee_academique: e.target.value})} placeholder="2024-2025" /></div>
            <div className="space-y-2"><Label htmlFor="date_ouverture">Date d'ouverture</Label><Input id="date_ouverture" type="datetime-local" value={formData.date_ouverture} onChange={e => setFormData({...formData, date_ouverture: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="date_cloture">Date de clôture</Label><Input id="date_cloture" type="datetime-local" value={formData.date_cloture} onChange={e => setFormData({...formData, date_cloture: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="niveau_concerne">Cycle concerné</Label><Select value={formData.niveau_concerne} onValueChange={value => setFormData({...formData, niveau_concerne: value as Cycle})}><SelectTrigger><SelectValue placeholder="Sélectionner un cycle"/></SelectTrigger><SelectContent>{CYCLES.map(c => <SelectItem key={c} value={c}>{CYCLE_LABELS[c]}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="statut">Statut</Label><Select value={formData.statut} onValueChange={value => setFormData({...formData, statut: value as StatutSession})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUTS.map(s => <SelectItem key={s} value={s}>{STATUT_SESSION_LABELS[s]}</SelectItem>)}</SelectContent></Select></div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Description de la session..." />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate("/sessions")}>Annuler</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Enregistrement...</> : <><Save className="mr-2 h-4 w-4"/>Enregistrer</>}</Button>
        </div>
      </form>
    </div>
  );
}
