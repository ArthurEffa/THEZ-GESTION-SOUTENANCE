import { useQuery } from "@tanstack/react-query";
import dossierService from "@/services/dossierService";

// Hook pour récupérer le NOMBRE de dossiers selon un statut
export const useGetDossiersCount = (statut: "DEPOSE" | "VALIDE" | "REJETE" | "BROUILLON", options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["dossiers", "count", { statut }],
        queryFn: async () => {
            const dossiers = await dossierService.getAll({ statut });
            return dossiers.length;
        },
        refetchInterval: 30000,
        enabled: options?.enabled ?? true,
    });
};
