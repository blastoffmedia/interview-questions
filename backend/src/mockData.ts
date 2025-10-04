import { Content } from "./types";

/**
 * Mock content data for the application
 * In a real app, this would come from your database
 */
export const mockContent: Record<string, Content> = {
  "101": {
    postId: 101,
    title: "10 Tips for Better UI Design",
    creatorName: "Sarah Chen",
    description:
      "Learn the fundamental principles of creating beautiful and functional user interfaces. This comprehensive guide covers color theory, typography, spacing, and layout best practices.",
    category: "Design",
    publishedDate: "2024-01-15",
  },
  "102": {
    postId: 102,
    title: "React Server Components Explained",
    creatorName: "Mike Rodriguez",
    description:
      "A deep dive into React Server Components and how they work in Next.js 15. Understand the benefits, use cases, and implementation patterns.",
    category: "Technology",
    publishedDate: "2024-03-22",
  },
  "103": {
    postId: 103,
    title: "Full Body Workout Routine",
    creatorName: "Emma Thompson",
    description:
      "30-minute full body workout you can do at home with no equipment. Perfect for busy schedules and all fitness levels.",
    category: "Fitness",
    publishedDate: "2023-11-08",
  },
  "104": {
    postId: 104,
    title: "Authentic Italian Pasta Recipe",
    creatorName: "Marco Bianchi",
    description:
      "My grandmother's secret pasta recipe passed down for generations. Simple ingredients, incredible flavor. Learn the traditional Italian technique.",
    category: "Food",
    publishedDate: "2024-02-10",
  },
  "105": {
    postId: 105,
    title: "Music Production Basics",
    creatorName: "Alex Kim",
    description:
      "Getting started with electronic music production - essential tools, software, and techniques for beginners. Create your first track today.",
    category: "Music",
    publishedDate: "2023-12-03",
  },
};
