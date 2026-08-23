export type PaginatedMeta = {
  page?: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

