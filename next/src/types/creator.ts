/**
 * TypeScript types for the application
 */

export interface Creator {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  followerCount: number;
  category: string;
  joinedDate: string;
  isVerified: boolean;
}

export interface User {
  email: string;
}
