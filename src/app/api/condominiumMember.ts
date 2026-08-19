import { api } from "@/lib/axios";
import type { PaginatedResponse } from "./PaginatedResponse";

const defaultUrl = "/condominium/";


export interface FetchMembersResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}


export const condominiumMemberApi = {

        fetchMembers: async (params: {
            statusInvitation?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
            role?: string;
            page?: number;
            size?: number;
            sortBy?: string;
            ascending?: boolean;
        } = {}, condominiumId?: string) => {
            const response = await api.get<PaginatedResponse<FetchMembersResponseDto>>(defaultUrl + condominiumId + "/member/fetch", {
                params: {
                    statusInvitation: params.statusInvitation || "",
                    email: params.email || "",
                    firstName: params.firstName || "",
                    lastName: params.lastName || "",
                    role: params.role || "",
                    page: params.page ?? 0,
                    size: params.size ?? 10,
                    sortBy: params.sortBy ?? "name",
                    ascending: params.ascending ?? true,
                },
            });
            return response.data;
        },

         createMember: async (data: {
                email: string;
                firstName: string;
                lastName: string;
                role: string;
            }, condominiumId?: string) => {
                const response = await api.post(
                    defaultUrl + condominiumId + "/member/create",
                    data
                );
        
                return response.data;
            },

            updateMember: async (data: {
                email: string;
                firstName: string;
                lastName: string;
                role: string;
            }, condominiumId?: string, memberId?: string) => {
                const response = await api.put(
                    defaultUrl + condominiumId + "/member/" + memberId + "/update",
                    data
                );
        
                return response.data;
            },

            deleteMember: async (condominiumId?: string, memberId?: string) => {
                const response = await api.delete(
                    defaultUrl + condominiumId + "/member/" + memberId + "/delete"
                );
        
                return response.data;
            },

            inviteMembers: async (data: {
                idMembers: string[];
            }, condominiumId?: string) => {
                const response = await api.post(
                    defaultUrl + condominiumId + "/member/invite",
                    data
                );
        
                return response.data;
            },

};