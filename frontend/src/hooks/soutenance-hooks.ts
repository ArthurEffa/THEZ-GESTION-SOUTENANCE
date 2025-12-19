
import { useQuery } from "@tanstack/react-query";
import soutenanceService from "@/services/soutenanceService";

export const useGetSoutenances = () => {
    return useQuery({
        queryKey: ["soutenances"],
        queryFn: soutenanceService.getAll,
    });
};

export const useGetSoutenanceById = (id: string) => {
    return useQuery({
        queryKey: ["soutenances", id],
        queryFn: () => soutenanceService.getById(id),
        enabled: !!id,
    });
};
