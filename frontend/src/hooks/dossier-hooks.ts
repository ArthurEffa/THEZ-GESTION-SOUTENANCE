import { useQuery } from "@tanstack/react-query";
import dossierService from "@/services/dossierService";

// Hook pour récupérer le NOMBRE de dossiers selon un statut
export const useGetDossiersCount = (statut: "DEPOSE" | "VALIDE" | "REJETE" | "BROUILLON") => {
    return useQuery({
        // La clé de requête inclut le statut pour que React Query gère un cache séparé pour chaque compteur
        queryKey: ["dossiers", "count", { statut }],
        queryFn: async () => {
            // On ne récupère que la liste, pas les détails, pour plus de performance
            const dossiers = await dossierService.getAll({ statut });
            return dossiers.length;
        },
        // Rafraîchir le compteur toutes les 30 secondes en arrière-plan
        refetchInterval: 30000,
    });
};
