import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatutSoutenance, STATUT_SOUTENANCE_LABELS } from "@/types/models";
import soutenanceService, { SoutenanceFormData } from "@/services/soutenanceService";
import dossierService from "@/services/dossierService";
import juryService from "@/services/juryService";
import salleService from "@/services/salleService";
import planifierSoutenanceHeroImg from "@/assets/illustrations/planifier-soutenance-hero.png";

const STATUTS: StatutSoutenance[] = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

export default function SoutenanceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<SoutenanceFormData>>({
    dossier_id: "",
    jury_id: "",
    salle_id: "",
    date_heure: "",
    duree_minutes: 60,
    ordre_passage: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: dossiers = [] } = useQuery({ queryKey: ['dossiers', { statut: 'VALIDE' }], queryFn: () => dossierService.getAll({ statut: 'VALIDE' }) });
  const { data: jurys = [] } = useQuery({ queryKey: ['jurys'], queryFn: juryService.getAll });
  const { data: salles = [] } = useQuery({ queryKey: ['salles'], queryFn: () => salleService.getAll({ est_disponible: true }) });

  const { data: soutenance, isLoading: isLoadingSoutenance } = useQuery({
    queryKey: ['soutenances', id],
    queryFn: () => soutenanceService.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (soutenance) {
      setFormData({
        dossier_id: soutenance.dossier.id,
        jury_id: soutenance.jury?.id,
        salle_id: soutenance.salle?.id,
        date_heure: soutenance.date_heure ? soutenance.date_heure.slice(0, 16) : "",
        duree_minutes: soutenance.duree_minutes,
        ordre_passage: soutenance.ordre_passage,
        statut: soutenance.statut,
      });
    }
  }, [soutenance]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<SoutenanceFormData>) => {
      const dataToSend = { ...data, date_heure: data.date_heure ? new Date(data.date_heure).toISOString() : undefined };
      return isEditing ? soutenanceService.update(id!, dataToSend) : soutenanceService.create(dataToSend as SoutenanceFormData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['soutenances'] });
      if(isEditing) await queryClient.invalidateQueries({ queryKey: ['soutenances', id] });
      toast.success(isEditing ? "Soutenance modifiée" : "Soutenance planifiée");
      navigate("/soutenances");
    },
    onError: (error: any) => {
        const errorData = error.response?.data;
        if (typeof errorData === 'object' && errorData !== null) setErrors(errorData);    
        else toast.error(errorData?.detail || "Une erreur est survenue.");
    },
  });

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.dossier_id) newErrors.dossier_id = "Le dossier est requis.";
    if (!formData.date_heure) newErrors.date_heure = "La date et l'heure sont requises.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
        saveMutation.mutate(formData);
    }
  };

  if (isLoadingSoutenance) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
             <div className="space-y-1">
                <Button variant="ghost" size="sm" onClick={() => navigate("/soutenances")} className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
                <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Modifier la soutenance" : "Planifier une soutenance"}</h1>
                <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
            </div>
            <img src={planifierSoutenanceHeroImg} alt="Planifier une soutenance" className="w-32 h-auto hidden md:block"/>
        </div>

        <form onSubmit={validateAndSubmit} className="space-y-8">
            <Card><CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Détails de la Soutenance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2"><Label>Dossier du candidat</Label><Select value={formData.dossier_id} onValueChange={dossier_id => setFormData({...formData, dossier_id})}><SelectTrigger className={errors.dossier_id ? "border-destructive" : ""}><SelectValue placeholder="Sélectionner un dossier validé"/></SelectTrigger><SelectContent>{dossiers.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.candidat?.nom_complet || d.candidat_nom || "-"} - {d.titre_memoire}</SelectItem>)}</SelectContent></Select>{errors.dossier_id && <p className="text-sm text-destructive">{errors.dossier_id}</p>}</div>
                    <div><Label>Jury assigné</Label><Select value={formData.jury_id} onValueChange={jury_id => setFormData({...formData, jury_id})}><SelectTrigger><SelectValue placeholder="Optionnel"/></SelectTrigger><SelectContent>{jurys.map(j => <SelectItem key={j.id} value={j.id}>{j.nom}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Salle</Label><Select value={formData.salle_id} onValueChange={salle_id => setFormData({...formData, salle_id})}><SelectTrigger><SelectValue placeholder="Optionnel"/></SelectTrigger><SelectContent>{salles.map(s => <SelectItem key={s.id} value={s.id}>{s.nom} ({s.batiment})</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Date et Heure</Label><Input type="datetime-local" value={formData.date_heure || ''} onChange={e => setFormData({...formData, date_heure: e.target.value})} className={errors.date_heure ? "border-destructive" : ""} />{errors.date_heure && <p className="text-sm text-destructive">{errors.date_heure}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Durée (min)</Label><Input type="number" value={formData.duree_minutes || 60} onChange={e => setFormData({...formData, duree_minutes: parseInt(e.target.value)})} /></div>
                        <div><Label>Ordre de passage</Label><Input type="number" value={formData.ordre_passage || ''} onChange={e => setFormData({...formData, ordre_passage: parseInt(e.target.value)})} /></div>
                    </div>
                    {isEditing && <div className="space-y-2"><Label>Statut</Label><Select value={formData.statut} onValueChange={statut => setFormData({...formData, statut: statut as StatutSoutenance})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STATUTS.map(s => <SelectItem key={s} value={s}>{STATUT_SOUTENANCE_LABELS[s]}</SelectItem>)}</SelectContent></Select></div>}
                </div>
            </CardContent></Card>
            
            <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate("/soutenances")}>Annuler</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Enregistrement...</> : <><Save className="mr-2 h-4 w-4"/>Enregistrer</>}</Button></div>
        </form>
    </div>
  );
}
