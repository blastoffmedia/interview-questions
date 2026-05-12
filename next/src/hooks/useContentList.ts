"use client";

import { useEffect, useState } from "react";
import { ContentItem, ContentListResponse } from "@/types/content";

interface UseContentListParams {
  category: string | null;
  page: number;
}

interface UseContentListResult {
  items: ContentItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const API_BASE = "http://localhost:3001/api/content";

export function useContentList({ category, page }: UseContentListParams): UseContentListResult {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (category) query.set("category", category);
    query.set("page", String(page));

    fetch(`${API_BASE}?${query.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<ContentListResponse>;
      })
      .then(data => {
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, [category, page]);

  return { items, total, loading, error };
}
