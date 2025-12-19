import { useQuery } from "@tanstack/react-query";
import sessionService from "@/services/sessionService";
import dossierService from "@/services/dossierService";
import juryService from "@/services/juryService";
import soutenanceService from "@/services/soutenanceService";

// Hook pour récupérer les détails d'une session par son ID
export const useGetSessionById = (id: string) => {
    return useQuery({
        queryKey: ["sessions", id],
        queryFn: () => sessionService.getById(id),
        enabled: !!id, // Ne s'exécute que si l'ID est présent
    });
};

// Hook pour récupérer les dossiers d'une session
export const useGetDossiersBySession = (sessionId: string) => {
    return useQuery({
        queryKey: ["dossiers", { session: sessionId }],
        queryFn: () => dossierService.getAll({ session: sessionId }),
        enabled: !!sessionId,
    });
};

// Hook pour récupérer les jurys d'une session
export const useGetJurysBySession = (sessionId: string) => {
    return useQuery({
        queryKey: ["jurys", { session: sessionId }],
        queryFn: () => juryService.getAll({ session: sessionId }),
        enabled: !!sessionId,
    });
};

// Hook pour récupérer les soutenances d'une session
export const useGetSoutenancesBySession = (sessionId: string) => {
    return useQuery({
        queryKey: ["soutenances", { session: sessionId }],
        queryFn: () => soutenanceService.getAll({ session: sessionId }),
        enabled: !!sessionId,
    });
};
