import { api } from "@/lib/axios";
import type { PaginatedResponse } from "./PaginatedResponse";

const defaultUrl = "/api/activity";

export interface FetchActivityResponseDto {
    condominiumName: string;
    activityType: string;
    entityType: string;
    description: string;
    createdAt: Date;
}

export const activityApi = {
    fetchActivities: async (params: {
        activityType?: string;
        entityType?: string;
        description?: string;
        fromCreatedAt?: string;
        toCreatedAt?: string;
        condominiumIds?: string[];
        page?: number;
        size?: number;
        sortBy?: string;
        ascending?: boolean;
    } = {}) => {
        const queryParams: Record<string, any> = {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sortBy: params.sortBy ?? "createdAt",
            ascending: params.ascending ?? false,
        };

        if (params.activityType) queryParams.activityType = params.activityType;
        if (params.entityType) queryParams.entityType = params.entityType;
        if (params.description) queryParams.description = params.description;
        if (params.fromCreatedAt) queryParams.fromCreatedAt = params.fromCreatedAt;
        if (params.toCreatedAt) queryParams.toCreatedAt = params.toCreatedAt;
        if (params.condominiumIds?.length) {
            queryParams.condominiumIds = params.condominiumIds.join(",");
        }

        const response = await api.get<PaginatedResponse<FetchActivityResponseDto>>(
            `${defaultUrl}/fetch`,
            { params: queryParams }
        );
        return response.data; // contiene data, totalPages, totalElements, last, ecc.
    },
};