export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}
