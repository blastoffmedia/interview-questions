"use client";

import Link from "next/link";
import { useState } from "react";
import { useContentList } from "@/hooks/useContentList";

const CATEGORIES = ["Design", "Tech", "Fitness", "Food", "Music"];
const PAGE_SIZE = 10;

export default function ContentListPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { items, total, loading, error } = useContentList({ category, page });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleCategoryChange(next: string | null) {
    setCategory(next);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Creator Content</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-3 py-1 rounded-full text-sm border ${
                category === null
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  category === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading && <p className="p-6 text-gray-500">Loading...</p>}
          {error && <p className="p-6 text-red-600">Error: {error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="p-6 text-gray-500">No content found.</p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {items.map(item => (
                <li key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.creatorName} · {item.category} · {item.platform}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{item.views.toLocaleString()} views</p>
                      <p>{item.publishedDate}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages} · {total} total
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
