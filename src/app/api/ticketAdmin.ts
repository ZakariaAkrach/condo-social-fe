// app/api/ticketAdmin.ts
import { api } from "@/lib/axios";

const baseUrl = (condominiumId: string) => `/condominium/${condominiumId}/admin/ticket`;

export const ticketAdminApi = {
  // Lista ticket con filtri e paginazione
  fetchTickets: async (
    condominiumId: string,
    params: {
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      priority?: string;
      createdByEmail?: string;
      assignedToEmail?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const response = await api.get(`${baseUrl(condominiumId)}/fetch-tickets`, { params });
    return response.data;
  },

  // Dettaglio ticket
  getTicketDetail: async (condominiumId: string, ticketId: string) => {
    const response = await api.get(`${baseUrl(condominiumId)}/${ticketId}/ticket-detail`);
    return response.data;
  },

  // Creazione messaggio
  createMessage: async (
    condominiumId: string,
    ticketId: string,
    data: { message: string; visibility: string }
  ) => {
    const response = await api.post(`${baseUrl(condominiumId)}/${ticketId}/create-message`, data);
    return response.data;
  },

  // Cambio stato
  changeStatus: async (
    condominiumId: string,
    ticketId: string,
    data: { status: string }
  ) => {
    const response = await api.put(`${baseUrl(condominiumId)}/${ticketId}/change-status`, data);
    return response.data;
  },

  // Assegnazione ticket
  assignTicket: async (
    condominiumId: string,
    ticketId: string,
    data: { email: string }
  ) => {
    const response = await api.put(`${baseUrl(condominiumId)}/${ticketId}/assign-ticket`, data);
    return response.data;
  },

  // Allegati
  fetchAttachments: async (
    condominiumId: string,
    ticketId: string,
    params: {
      originalName?: string;
      firstName?: string;
      lastName?: string;
      visibility?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const response = await api.get(`${baseUrl(condominiumId)}/${ticketId}/fetch-attachments`, { params });
    return response.data;
  },

  // Messaggi
  fetchMessages: async (
    condominiumId: string,
    ticketId: string,
    params: {
      message?: string;
      visibility?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const response = await api.get(`${baseUrl(condominiumId)}/${ticketId}/fetch-messages`, { params });
    return response.data;
  },

  // Upload allegato (step 1)
  uploadAttachment: async (
    condominiumId: string,
    ticketId: string,
    data: {
      originalFileName: string;
      size: number;
      contentType: string;
      extension: string;
      visibility?: string;
    }
  ) => {
    const response = await api.post(`${baseUrl(condominiumId)}/${ticketId}/upload`, data);
    return response.data;
  },

  // Conferma upload (step 2)
  confirmUpload: async (
    condominiumId: string,
    ticketId: string,
    attachmentId: string
  ) => {
    const response = await api.post(`${baseUrl(condominiumId)}/${ticketId}/attachment/${attachmentId}/confirm-upload`);
    return response.data;
  },
};