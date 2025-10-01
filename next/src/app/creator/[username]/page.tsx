"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/types/creator";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Creator Profile Page - Protected Route
 *
 * TODO for candidates:
 * 1. Check if user is authenticated, redirect to /login if not
 * 2. Fetch creator data from Express backend: http://localhost:3001/api/creators/[username]
 * 3. Display loading/error states
 * 4. Show creator info: name, username, bio, follower count, logout button
 */
export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = params.username as string;

  useEffect(() => {
    // TODO: Check authentication and fetch data
  }, [username, isAuthenticated, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!creator) return <div className="p-8">Creator not found</div>;

  // TODO: Display creator profile
  // Required: name, username (@username), bio, follower count, logout button
  // Use Tailwind for basic styling

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Display creator profile here...</p>
      </div>
    </div>
  );
}
