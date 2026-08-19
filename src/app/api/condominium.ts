import { api } from "@/lib/axios";
import type { PaginatedResponse } from "./PaginatedResponse";

const defaultUrl = "/api/condominiums";

export interface CondominiumDto {
    id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    cap: string;
    condominiumEmail: string;
}

export const condominiumApi = {

    createCondominium: async (data: {
        country: string;
        name: string;
        city: string;
        address: string;
        cap: string;
        condominiumEmail: string;
    }) => {
        const response = await api.post(
            defaultUrl + "/create",
            data
        );

        return response.data;
    },

    updateCondominium: async (data: {
        country: string;
        name: string;
        city: string;
        address: string;
        cap: string;
        condominiumEmail: string;
    }, condominiumId: String) => {
        const response = await api.put(
            defaultUrl + "/" + condominiumId + "/update",
            data
        );

        return response.data;
    },

    fetchCondominiums: async (params: {
        name?: string;
        country?: string;
        city?: string;
        cap?: string;
        address?: string;
        condominiumEmail?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        ascending?: boolean;
    } = {}) => {
        const response = await api.get<PaginatedResponse<CondominiumDto>>(defaultUrl + "/fetch", {
            params: {
                name: params.name || "",
                country: params.country || "",
                city: params.city || "",
                cap: params.cap || "",
                address: params.address || "",
                condominiumEmail: params.condominiumEmail || "",
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy ?? "name",
                ascending: params.ascending ?? true,
            },
        });
        return response.data;
    },

    deleteCondominium: async (condominiumId: String) => {
        const response = await api.delete(
            defaultUrl + "/" + condominiumId +"/delete"
        );

        return response.data;
    },

    detailCondominium: async (condominiumId: String) => {
        const response = await api.get(
            defaultUrl + "/" + condominiumId
        );

        return response.data;
    },

};