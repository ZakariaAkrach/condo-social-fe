// src/app/api/postResident.ts
import { api } from "@/lib/axios";

const defaultUrl = "/condominium";

export interface FetchResidentPostsParams {
  title?: string;
  body?: string;
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

export interface PollOptionsResidentResponseDto {
  optionId: string;
  optionText: string;
  numberVotes: number;
}

export interface PollQuestionResidentResponseDto {
  question: string;
  optionTexts: PollOptionsResidentResponseDto[];
  userVoted: boolean;
  userOptionId: string | null;
}

export interface PollVoteRequest {
  optionId: string;
}

export const postResidentApi = {
  // Fetch posts con filtri
  fetchPosts: async (condominiumId: string, params: FetchResidentPostsParams) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/post/fetch`,
      { params }
    );
    return response.data;
  },

  // Fetch dettaglio post
  fetchPostDetail: async (condominiumId: string, postId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/post/${postId}/detail`
    );
    return response.data;
  },

  // Fetch documenti del post
  fetchPostDocuments: async (
    condominiumId: string,
    postId: string,
    params: FetchPostDocumentsParams
  ) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/post/${postId}/documents`,
      { params }
    );
    return response.data;
  },

  // Fetch poll del post
  fetchPostPoll: async (condominiumId: string, postId: string) => {
    const response = await api.get(
      `${defaultUrl}/${condominiumId}/resident/post/${postId}/poll`
    );
    return response.data;
  },

  // Vota un'opzione del poll
  pollVote: async (condominiumId: string, postId: string, data: PollVoteRequest) => {
    const response = await api.post(
      `${defaultUrl}/${condominiumId}/resident/post/${postId}/poll-vote`,
      data
    );
    return response.data;
  },
};