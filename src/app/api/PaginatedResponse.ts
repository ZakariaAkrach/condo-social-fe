export interface PaginatedResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    lastPage: boolean;
}