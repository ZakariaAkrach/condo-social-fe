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

    programDeletion: async (condominiumId: string, documentId: string) => {
        const response = await api.delete(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/program-deletion`
        );
        return response.data;
    },

    deleteDocument: async (condominiumId: string, documentId: string) => {
        const response = await api.delete(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/delete`
        );
        return response.data;
    },

    bulkProgramDeletion: async (condominiumId: string, idDocuments: string[]) => {
        const response = await api.delete(
            `${defaultUrl}${condominiumId}/admin/document/bulk-program-deletion`,
            { data: { idDocuments } } // DELETE con body
        );
        return response.data;
    },

    bulkDeletion: async (condominiumId: string, idDocuments: string[]) => {
        const response = await api.delete(
            `${defaultUrl}${condominiumId}/admin/document/bulk-deletion`,
            { data: { idDocuments } }
        );
        return response.data;
    },

    changeStatus: async (condominiumId: string, documentId: string, status: string) => {
        const response = await api.post(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/status`,
            { status }
        );
        return response.data;
    },

    fetchVersions: async (
        condominiumId: string,
        documentId: string,
        params: {
            originalName?: string;
            contentType?: string;
            page?: number;
            size?: number;
            sortBy?: string;
            ascending?: boolean;
        }
    ) => {
        const response = await api.get(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/fetch-versions`,
            { params }
        );
        return response.data;
    },

    // Alla fine di documentAdminApi, aggiungi:

    addNewVersion: async (
        condominiumId: string,
        documentId: string,
        data: {
            originalFileName: string;
            size: number;
            contentType: string;
            extension: string;
        }
    ) => {
        const response = await api.post(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/add-new-version`,
            data
        );
        return response.data;
    },

    fetchVisibility: async (
        condominiumId: string,
        documentId: string,
        params?: {
            firstName?: string;
            lastName?: string;
            role?: string;
            page?: number;
            size?: number;
            sortBy?: string;
            ascending?: boolean;
        }
    ) => {
        const response = await api.get(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/fetch-visibility`,
            { params }
        );
        return response.data;
    },

    updateVisibility: async (
        condominiumId: string,
        documentId: string,
        data: {
            addMembers?: string[];
            removeMembers?: string[];
            addAll?: boolean;
        }
    ) => {
        const response = await api.post(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/visibility`,
            data
        );
        return response.data;
    },
    
    download: async (
        condominiumId: string,
        documentId: string,
        requestedVersion?: number
    ) => {
        const params = requestedVersion !== undefined ? { requestedVersion } : {};
        const response = await api.get(
            `${defaultUrl}${condominiumId}/admin/document/${documentId}/download`,
            { params }
        );
        return response.data; // { success, statusCode, message, data: presignedUrl }
    },
};