import { api } from "@/lib/axios";

const defaultUrl = "/condominium/";


export const documentAdminApi = {
    
    upload: async (data: {
            versioningEnabled: boolean;
            originalFileName: string;
            size: number;
            contentType: string;
            extension: string;
            status: string;
        }, condominiumId: String) => {
            const response = await api.post(
                defaultUrl + condominiumId + "/admin/document/upload",
                data
            );
    
            return response.data;
        },
};