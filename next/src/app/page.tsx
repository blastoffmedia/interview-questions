import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Creator Platform
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="pt-2">
            <Link
              href="/content"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Creator Content List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
