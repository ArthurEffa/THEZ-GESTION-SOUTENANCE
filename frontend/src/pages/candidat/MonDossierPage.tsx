import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Upload, Clock, CheckCircle, ChevronRight, Calendar, Users, Loader2, FolderPlus, Paperclip, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMonDossier } from "@/hooks/me-hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import dossierService from "@/services/dossierService";
import { DossierStatus, TypePiece } from "@/types/models";
import { CreateDossierDialog } from "@/components/candidats/CreateDossierDialog";
import dossierHeroImg from "@/assets/illustrations/dossier-hero.png";

const STEPS = ["Brouillon", "Soumission", "Validation", "Soutenance"];
const statusToStep: Record<DossierStatus, number> = { BROUILLON: 0, DEPOSE: 1, VALIDE: 2, REJETE: 1 };

const PIECES_REQUISES: { type: TypePiece, label: string, obligatoire: boolean }[] = [
    { type: "MEMOIRE", label: "Mémoire Final", obligatoire: true },
    { type: "RECU_PAIEMENT", label: "Quitus de Paiement", obligatoire: true },
    { type: "CERTIFICAT_SCOLARITE", label: "Certificat de Scolarité", obligatoire: true },
    { type: "ACCORD_STAGE", label: "Accord de Stage", obligatoire: false },
];

const StatusTimeline = ({ status }) => {
    const currentStep = statusToStep[status] || 0;
    // ... (same implementation)
};

const NoDossierState = ({ onCreate }) => (
    <Card className="text-center py-12 px-6"><CardContent><FolderPlus className="h-16 w-16 mx-auto text-primary mb-4" /><h2 className="text-xl font-semibold">Commencez votre parcours</h2><p className="text-muted-foreground mt-2 mb-6">Vous n'avez pas encore de dossier. Créez-en un pour commencer.</p><Button onClick={onCreate}>Créer mon dossier</Button></CardContent></Card>
);

export default function MonDossierPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [uploading, setUploading] = useState<TypePiece | null>(null);

    const { data: dossier, isLoading: isLoadingDossier } = useGetMonDossier();

    const uploadMutation = useMutation({
        mutationFn: (data: { file: File; type: TypePiece }) =>
            documentService.create({
                dossier_id: dossier!.id,
                type_piece: data.type,
                nom: data.file.name,
                fichier: data.file,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monDossier'] });
            toast.success("Document uploadé avec succès");
            setUploading(null);
        },
        onError: () => {
            toast.error("Erreur lors de l'upload du document");
            setUploading(null);
        },
    });

    const submitMutation = useMutation({
        mutationFn: () => dossierService.update(dossier!.id, { statut: 'DEPOSE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monDossier'] });
            toast.success("Dossier soumis avec succès !");
        },
        onError: () => {
            toast.error("Erreur lors de la soumission du dossier");
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, pieceType: TypePiece) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(pieceType);

        // Supprimer l'ancien document du meme type s'il existe
        const existingDoc = dossier?.documents.find(d => d.type_piece === pieceType);
        if (existingDoc) {
            try {
                await documentService.delete(existingDoc.id);
            } catch {
                // Continue meme si la suppression echoue
            }
        }

        uploadMutation.mutate({ file, type: pieceType });
        e.target.value = '';
    };
    const allRequiredFilesUploaded = dossier ? PIECES_REQUISES.every(p => !p.obligatoire || dossier.documents.some(d => d.type_piece === p.type)) : false;

    if (isLoadingDossier) return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                 <div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{user?.firstName?.charAt(0)}</AvatarFallback></Avatar><div><h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1><p className="text-muted-foreground">{user?.email}</p></div></div>
                <img src={dossierHeroImg} alt="Gestion de dossier" className="w-24 h-auto hidden sm:block opacity-80"/>
            </div>

            {!dossier ? (
                <NoDossierState onCreate={() => setCreateDialogOpen(true)} />
            ) : (
                <>
                    <StatusTimeline status={dossier.statut} />

                    {dossier.statut === 'REJETE' && (
                        <Card className="border-destructive bg-destructive/10"><CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0"/>
                                <div>
                                    <h3 className="font-semibold text-destructive">Votre dossier a été rejeté</h3>
                                    <p className="text-sm text-destructive/80 mt-1">Motif : {dossier.commentaires_admin || "Aucun commentaire fourni."}</p>
                                    <p className="text-sm text-destructive/80 mt-2">Veuillez corriger les erreurs et soumettre à nouveau votre dossier.</p>
                                </div>
                            </div>
                        </CardContent></Card>
                    )}

                    <Card><CardContent className="pt-6 space-y-4">
                        <h3 className="text-lg font-semibold">Pièces à Fournir</h3>
                        <div className="space-y-3 pt-2">
                            {PIECES_REQUISES.map(piece => {
                                const document = dossier.documents.find(d => d.type_piece === piece.type);
                                return (
                                    <div key={piece.type} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {document ? <CheckCircle className="h-6 w-6 text-green-500"/> : <Paperclip className="h-6 w-6 text-muted-foreground"/>}
                                            <div><p className="font-medium">{piece.label} {piece.obligatoire && <span className="text-destructive">*</span>}</p>{document && <a href={document.fichier} target="_blank" className="text-xs text-blue-600 hover:underline">Voir le fichier</a>}</div>
                                        </div>
                                        {(dossier.statut === 'BROUILLON' || dossier.statut === 'REJETE') &&
                                            <Button asChild variant="secondary" size="sm"><Label htmlFor={`upload-${piece.type}`} className="cursor-pointer">
                                                {uploading === piece.type ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                                                <span className="ml-2">{document ? "Remplacer" : "Déposer"}</span>
                                                <Input id={`upload-${piece.type}`} type="file" className="hidden" onChange={(e) => handleFileChange(e, piece.type)} accept=".pdf,.jpg,.jpeg,.png"/>
                                            </Label></Button>
                                        }
                                    </div>
                                );
                            })}
                        </div>
                        {(dossier.statut === 'BROUILLON' || dossier.statut === 'REJETE') && allRequiredFilesUploaded && (
                            <div className="pt-4 border-t">
                                <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="w-full"><Send className="h-4 w-4 mr-2"/>Soumettre à nouveau le dossier</Button>
                            </div>
                        )}
                    </CardContent></Card>
                </>
            )}
            <CreateDossierDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['monDossier'] })} />
        </div>
    );
}
