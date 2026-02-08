import { useQuery } from "@tanstack/react-query";
import dossierService from "@/services/dossierService";
import soutenanceService from "@/services/soutenanceService";

// Hook pour récupérer le dossier du candidat connecté
export const useGetMonDossier = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["monDossier"],
        queryFn: () => dossierService.getMesDossiers(),
        select: (data) => data && data.length > 0 ? data[0] : null,
        enabled: options?.enabled ?? true,
    });
};

// Hook pour récupérer la soutenance du candidat connecté
export const useGetMaSoutenance = () => {
    return useQuery({
        queryKey: ["maSoutenance"],
        queryFn: () => soutenanceService.getMesSoutenances(),
        select: (data) => data && data.length > 0 ? data[0] : null,
    });
};
