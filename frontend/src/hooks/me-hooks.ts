import { useQuery } from "@tanstack/react-query";
import dossierService from "@/services/dossierService";
import soutenanceService from "@/services/soutenanceService";

// Hook pour récupérer le dossier du candidat connecté
export const useGetMonDossier = () => {
    return useQuery({
        queryKey: ["monDossier"],
        // La méthode getAll est utilisée car le backend filtre par utilisateur connecté sur cette route
        queryFn: () => dossierService.getMesDossiers(), 
        // La donnée retournée est un tableau, mais on ne veut que le premier élément (un candidat n'a qu'un dossier par session)
        select: (data) => data && data.length > 0 ? data[0] : null,
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
