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

    confirmUpload: async (condominiumId: string, documentVersionId: string) => {
        const response = await api.post(
            defaultUrl + condominiumId + "/admin/document/" + documentVersionId + "/confirm-upload"
        );
        return response.data;
    },

    fetch: async (
        condominiumId: string,
        params: {
            versioningEnabled?: boolean;
            currentVersion?: number;
            status?: string;
            originalName?: string;
            contentType?: string;
            page?: number;
            size?: number;
            sortBy?: string;
            ascending?: boolean;
        }
    ) => {
        const response = await api.get(
            `${defaultUrl}${condominiumId}/admin/document/fetch`,
            { params }
        );
        return response.data;
    },

    detail: async (condominiumId: string, documentId: string) => {
    const response = await api.get(
      `${defaultUrl}${condominiumId}/admin/document/${documentId}/detail`
    );
    return response.data;
  },
};