// src/app/api/notification.ts
import { api } from "@/lib/axios";

const defaultUrl = "/api/notification";

export interface NotificationResponse {
  id: string;
  notificationType: string;
  title: string;
  description: string;
  actionId: string | null;
  condominiumId: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotificationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: NotificationResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface UnreadNotificationResponse {
  unreadNotifications: number;
}

export const notificationApi = {
  /**
   * Recupera le notifiche paginate per un condominio
   */
  fetchNotifications: async (
    condominiumId: string,
    page: number = 0,
    size: number = 20,
    ascending: boolean = false,
    sortBy: string = "createdAt"
  ): Promise<PaginatedNotificationResponse> => {
    const response = await api.get(defaultUrl + "/fetch", {
      params: {
        condominiumId,
        page,
        size,
        sortBy,
        ascending,
      },
    });

    return response.data;
  },

  /**
   * Segna una notifica come letta
   */
  markAsRead: async (
    condominiumId: string,
    notificationId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(
      `${defaultUrl}/${condominiumId}/${notificationId}/read`
    );

    return response.data;
  },

  getUnreadCount: async (
    condominiumId: string
  ): Promise<UnreadNotificationResponse> => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/get-all-unread`
    );
    return response.data.data;
  },
};