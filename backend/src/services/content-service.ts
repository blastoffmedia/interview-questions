import { ContentItem, ContentListResponse } from "../types";
import { mockContent } from "../mockData";

interface ListContentParams {
  category?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export function listContent(params: ListContentParams): ContentListResponse {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

  let filtered: ContentItem[] = mockContent;

  if (params.category) {
    filtered = filtered.filter(item => item.category === params.category);
  }

  const sorted = [...filtered].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate)
  );

  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}
