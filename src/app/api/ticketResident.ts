// src/app/api/ticketResident.ts
import { api } from "@/lib/axios";

const defaultUrl = "/condominium";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "CLOSED" | "WAITING_ADMIN";
export type TicketCategory = "MAINTENANCE" | "CLEANING" | "NOISE" | "ADMINISTRATIVE" | "SECURITY" | "UTILITIES" | "COMMON_AREAS" | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface UploadAttachmentRequest {
  originalFileName: string;
  size: number;
  contentType: string;
  extension: string;
  visibility?: "PUBLIC" | "INTERNAL";
}

export interface UploadAttachmentResponse {
  ticketAttachmentId: string;
  originalName: string;
  uploadUrl: string;
}

export interface CreateMessageRequest {
  message: string;
}

export interface CreateMessageResponse {
  id: string;
  firstName: string;
  lastName: string;
  message: string;
  createdAt: string;
}

export interface TicketDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: string;
  closedAt?: string;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  firstName: string;
  lastName: string;
  message: string;
  createdAt: string;
}

export interface TicketAttachmentItem {
  id: string;
  originalName: string;
  size: number;
  contentType: string;
  extension: string;
  firstName: string;
  lastName: string;
}

export interface TicketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: string;
  closedAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  success: boolean;
  statusCode: number;
  message: string;
}

export const ticketResidentApi = {
  create: async (condominiumId: string, data: CreateTicketRequest) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/resident/ticket/create`,
      data
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: { ticketId: string };
    };
  },

  createMessage: async (condominiumId: string, ticketId: string, data: CreateMessageRequest) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/create-message`,
      data
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: CreateMessageResponse;
    };
  },

  fetchTickets: async (
    condominiumId: string,
    params?: {
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      priority?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.title) queryParams.append("title", params.title);
    if (params?.description) queryParams.append("description", params.description);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.page !== undefined) queryParams.append("page", String(params.page));
    if (params?.size !== undefined) queryParams.append("size", String(params.size));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.ascending !== undefined) queryParams.append("ascending", String(params.ascending));

    const url = `${defaultUrl}/${condominiumId}/resident/ticket/fetch-tickets?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data as PaginatedResponse<TicketListItem>;
  },

  ticketDetail: async (condominiumId: string, ticketId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/ticket-detail`
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: TicketDetail;
    };
  },

  fetchMessages: async (
    condominiumId: string,
    ticketId: string,
    params?: {
      message?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.message) queryParams.append("message", params.message);
    if (params?.page !== undefined) queryParams.append("page", String(params.page));
    if (params?.size !== undefined) queryParams.append("size", String(params.size));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.ascending !== undefined) queryParams.append("ascending", String(params.ascending));

    const url = `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/fetch-messages?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data as PaginatedResponse<TicketMessage>;
  },

  fetchAttachments: async (
    condominiumId: string,
    ticketId: string,
    params?: {
      originalName?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      ascending?: boolean;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.originalName) queryParams.append("originalName", params.originalName);
    if (params?.page !== undefined) queryParams.append("page", String(params.page));
    if (params?.size !== undefined) queryParams.append("size", String(params.size));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.ascending !== undefined) queryParams.append("ascending", String(params.ascending));

    const url = `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/fetch-attachments?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data as PaginatedResponse<TicketAttachmentItem>;
  },

  upload: async (
    condominiumId: string,
    ticketId: string,
    data: UploadAttachmentRequest
  ) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/upload`,
      data
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: UploadAttachmentResponse;
    };
  },

  confirmUpload: async (
    condominiumId: string,
    ticketId: string,
    attachmentId: string
  ) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/attachment/${attachmentId}/confirm-upload`
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: string;
    };
  },

  deleteAttachment: async (
    condominiumId: string,
    ticketId: string,
    attachmentId: string
  ) => {
    const response = await api.delete(
      `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/attachment/${attachmentId}/delete`
    );
    return response.data as {
      success: boolean;
      statusCode: number;
      message: string;
      data: string;
    };
  },

  download: async (
  condominiumId: string,
  ticketId: string,
  attachmentId: string
) => {
  const response = await api.get(
    `${defaultUrl}/${condominiumId}/resident/ticket/${ticketId}/download?attachmentId=${attachmentId}`
  );
  return response.data as {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
      downloadURL: string;
      fileName: string;
    };
  };
},
};