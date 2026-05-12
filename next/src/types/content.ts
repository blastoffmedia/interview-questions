export interface ContentItem {
  id: number;
  title: string;
  creatorName: string;
  category: string;
  platform: string;
  views: number;
  publishedDate: string;
}

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
}
