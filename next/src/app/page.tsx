"use client";

import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import Link from "next/link";

export default function Home() {
  const { viewHistory, clearHistory } = useViewingHistory();

  const totalViews = viewHistory.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Creator Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Interview Coding Challenge
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please read the README.md file for instructions on the coding
              challenge.
            </p>
          </div>

          {/* Viewing History Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                📊 Viewing History Tracker
              </h3>
              {viewHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Clear history
                </button>
              )}
            </div>

            {viewHistory.length === 0 ? (
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Click any post below to start tracking your viewing history!
              </p>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100 dark:bg-blue-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-blue-900 dark:text-blue-100 font-semibold">
                          Post ID
                        </th>
                        <th className="px-4 py-2 text-left text-blue-900 dark:text-blue-100 font-semibold">
                          View Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewHistory.map(item => (
                        <tr
                          key={item.postId}
                          className="border-t border-blue-200 dark:border-blue-800"
                        >
                          <td className="px-4 py-2 text-blue-900 dark:text-blue-100">
                            {item.postId}
                          </td>
                          <td className="px-4 py-2 text-blue-900 dark:text-blue-100">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-3">
                  Total views: {totalViews} across {viewHistory.length} post
                  {viewHistory.length === 1 ? "" : "s"}
                </p>
              </>
            )}
          </div>

          {/* Content Posts */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📝 Available Content Posts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Click any post ID to view content. Your viewing history will
                track which posts you&apos;ve visited!
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[101, 102, 103, 104, 105].map(id => (
                <Link
                  key={id}
                  href={`/content/${id}`}
                  className="py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
