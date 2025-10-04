/**
 * TypeScript types for the backend
 */

export interface Content {
  postId: number;
  title: string;
  creatorName: string;
  description: string;
  publishedDate: string;
  category: string;
}

export interface User {
  email: string;
}
