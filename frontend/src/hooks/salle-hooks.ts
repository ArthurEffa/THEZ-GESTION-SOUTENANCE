
import { useQuery } from "@tanstack/react-query";
import salleService from "@/services/salleService";
import soutenanceService from "@/services/soutenanceService";

export const useGetSalles = () => {
    return useQuery({
        queryKey: ["salles"],
        queryFn: salleService.getAll,
    });
};

export const useGetSalleById = (id: string) => {
    return useQuery({
        queryKey: ["salles", id],
        queryFn: () => salleService.getById(id),
        enabled: !!id,
    });
};

export const useGetSoutenancesBySalle = (salleId: string) => {
    return useQuery({
        queryKey: ["soutenances", { salle: salleId }],
        queryFn: () => soutenanceService.getAll({ salle: salleId }),
        enabled: !!salleId,
    });
};
