import Link from "next/link";

export default function Home() {
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
              Please read the README.md file for instructions on the coding challenge.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
            <Link
              href="/creator/sarah_designs"
              className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Try Creator Profile (Protected)
            </Link>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available test usernames: sarah_designs, tech_mike, fitness_emma, chef_marco, music_alex
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
