import { useQuery } from "@tanstack/react-query";
import juryService from "@/services/juryService";
import soutenanceService from "@/services/soutenanceService";

// Hook pour récupérer les détails d'un jury par son ID
export const useGetJuryById = (id: string) => {
    return useQuery({
        queryKey: ["jurys", id],
        queryFn: () => juryService.getById(id),
        enabled: !!id, 
    });
};

// Hook pour récupérer les soutenances assignées à un jury
export const useGetSoutenancesByJury = (juryId: string) => {
    return useQuery({
        queryKey: ["soutenances", { jury: juryId }],
        queryFn: () => soutenanceService.getAll({ jury: juryId }),
        enabled: !!juryId,
    });
};
