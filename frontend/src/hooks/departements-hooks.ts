
import { useQuery } from "@tanstack/react-query";
import departementService from "@/services/departementService";
import enseignantService from "@/services/enseignantService";
import candidatService from "@/services/candidatService";

export const useGetDepartements = () => {
    return useQuery({
        queryKey: ["departements"],
        queryFn: departementService.getAll,
    });
};

export const useGetDepartementById = (id: string) => {
    return useQuery({
        queryKey: ["departements", id],
        queryFn: () => departementService.getById(id),
        enabled: !!id, // The query will not run until the id is available
    });
};

export const useGetEnseignantsByDepartement = (departementId: string) => {
    return useQuery({
        queryKey: ["enseignants", { departement: departementId }],
        queryFn: () => enseignantService.getByDepartement(departementId),
        enabled: !!departementId,
    });
};

export const useGetCandidatsByDepartement = (departementId: string) => {
    return useQuery({
        queryKey: ["candidats", { departement: departementId }],
        queryFn: () => candidatService.getByDepartement(departementId),
        enabled: !!departementId,
    });
};

