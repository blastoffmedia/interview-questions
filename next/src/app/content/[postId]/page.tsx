"use client";

import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import { Content } from "@/types/creator";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Content Viewer Page
 *
 * TODO for candidates:
 * 1. Fetch content from Express backend: http://localhost:3001/api/content/[postId]
 * 2. When content loads successfully, call addToHistory(Number(postId))
 * 3. Display loading/error states
 * 4. Show content from API: title, creator, description, category, published date
 * 5. Show YOUR view count: "You've viewed this post X time(s)" using getViewCount()
 * 6. Calculate total views across all posts using viewHistory
 * 7. Add back button with router.push('/')
 */
export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { addToHistory, getViewCount, viewHistory } = useViewingHistory();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const postId = params.postId as string;

  useEffect(() => {
    // TODO: Fetch content and add to viewing history
    // Example:
    // fetch(`http://localhost:3001/api/content/${postId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setContent(data);
    //     addToHistory(Number(postId));
    //     setLoading(false);
    //   })
    //   .catch(err => setError(err.message));
  }, [postId, addToHistory]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!content) return <div className="p-8">Content not found</div>;

  const myViewCount = getViewCount(Number(postId));
  const totalViews = viewHistory.reduce((sum, item) => sum + item.count, 0);

  // TODO: Display content
  // Required from API: title, creator, description, category, publishedDate
  // Required from context: myViewCount, totalViews
  // Add back button that calls router.push('/')
  // Use Tailwind for styling

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Display content here...</p>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-700">
            📊 You've viewed this post {myViewCount} time
            {myViewCount === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-gray-500">
            Total views across all posts: {totalViews}
          </p>
        </div>
      </div>
    </div>
  );
}
