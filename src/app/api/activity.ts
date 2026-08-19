// lib/api/activity.ts
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
        createdAt?: Date;
        condominiumIds?: string[];
        page?: number;
        size?: number;
        sortBy?: string;
        ascending?: boolean;
    } = {}) => {
        const response = await api.get<PaginatedResponse<FetchActivityResponseDto>>(
            `${defaultUrl}/fetch`,
            {
                params: {
                    activityType: params.activityType || "",
                    entityType: params.entityType || "",
                    description: params.description || "",
                    createdAt: params.createdAt?.toISOString() || null,
                    condominiumIds: params.condominiumIds?.join(",") || "",
                    page: params.page ?? 0,
                    size: params.size ?? 10,
                    sortBy: params.sortBy ?? "createdAt",
                    ascending: params.ascending ?? false,
                },
            }
        );
        return response.data;
    },
};