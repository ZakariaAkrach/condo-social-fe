// app/api/documentResident.ts
import { api } from "@/lib/axios";

const defaultUrl = "/condominium";

export const documentResidentApi = {
  fetch: async (
    condominiumId: string,
    params: {
      versioningEnabled?: boolean;
      currentVersion?: number;
      originalName?: string;
      contentType?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/document/fetch`,
      { params }
    );
    return response.data;
  },

  detail: async (condominiumId: string, documentId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/document/${documentId}/detail`
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
      `${defaultUrl}/${condominiumId}/resident/document/${documentId}/fetch-versions`,
      { params }
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
      `${defaultUrl}/${condominiumId}/resident/document/${documentId}/download`,
      { params }
    );
    return response.data;
  },
};