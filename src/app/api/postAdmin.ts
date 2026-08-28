// src/app/api/postAdmin.ts
import { api } from "@/lib/axios";

const defaultUrl = "/condominium";

export interface FetchPostsParams {
  title?: string;
  body?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface FetchPostDocumentsParams {
  originalName?: string;
  contentType?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface FetchPollVotesParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  status: "ACTIVE" | "DRAFT";
  documents?: string[];
  poll?: {
    question: string;
    optionTexts: string[];
  };
}

export interface BulkPostDeleteRequest {
  idPosts: string[];
}

export interface PostBulkProgramDeletionRequest {
  idPosts: string[];
}

export interface ChangeStatusRequest {
  status: string;
}

export interface FetchPostsResponseDto {
  id: string;
  title: string;
  body: string;
  status: string;
  documents: number;
  poll: boolean;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string;
  createdByFirstName: string;
  createdByLastName: string;
}

export interface FetchDetailPostResponseDto {
  id: string;
  title: string;
  body: string;
  status: string;
  documents: number;
  poll: boolean;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string;
  createdByFirstName: string;
  createdByLastName: string;
}

export interface FetchPostDocumentsResponseDto {
  documentId: string;
  currentVersion: number;
  status: string;
  originalName: string;
  contentType: string;
  publicForCondominium: boolean;
}

export interface PollResponseDto {
  question: string;
  optionTexts: string[];
}

export interface PollVotesAdminResponseDto {
  optionId: string;
  optionText: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PollOptionVotesResponseDto {
  optionId: string;
  optionText: string;
  countVotes: number;
}

export interface BulkPostDeleteAdminResponseDto {
  failureId: string[];
  deletedCount: number;
}

export interface PostBulkProgramDeletionAdminResponseDto {
  failureId: string[];
  countMoveToTrash: number;
}

export const postAdminApi = {
  createPost: async (condominiumId: string, data: CreatePostRequest) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/admin/post/create`,
      data
    );
    return response.data;
  },

  fetchPosts: async (condominiumId: string, params: FetchPostsParams) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/fetch`,
      { params }
    );
    return response.data;
  },

  fetchPostDetail: async (condominiumId: string, postId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/detail`
    );
    return response.data;
  },

  fetchPostDocuments: async (
    condominiumId: string,
    postId: string,
    params: FetchPostDocumentsParams
  ) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/documents`,
      { params }
    );
    return response.data;
  },

  fetchPostPoll: async (condominiumId: string, postId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/poll`
    );
    return response.data;
  },

  fetchPollVotes: async (
    condominiumId: string,
    postId: string,
    params: FetchPollVotesParams
  ) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/votes-members`,
      { params }
    );
    return response.data;
  },

  fetchPollOptionVotes: async (condominiumId: string, postId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/votes-count`
    );
    return response.data;
  },

  programDeletion: async (condominiumId: string, postId: string) => {
    const response = await api.delete(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/program-deletion`
    );
    return response.data;
  },

  deletePost: async (condominiumId: string, postId: string) => {
    const response = await api.delete(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/delete`
    );
    return response.data;
  },

  bulkProgramDeletion: async (
    condominiumId: string,
    data: PostBulkProgramDeletionRequest
  ) => {
    const response = await api.delete(
      `${defaultUrl}/${condominiumId}/admin/post/bulk-program-deletion`,
      { data }
    );
    return response.data;
  },

  bulkDeletion: async (condominiumId: string, data: BulkPostDeleteRequest) => {
    const response = await api.delete(
      `${defaultUrl}/${condominiumId}/admin/post/bulk-deletion`,
      { data }
    );
    return response.data;
  },

  changeStatus: async (
    condominiumId: string,
    postId: string,
    data: ChangeStatusRequest
  ) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/admin/post/${postId}/status`,
      data
    );
    return response.data;
  },
};