import { Creator } from "./types";

/**
 * Mock creator data for the application
 * In a real app, this would come from your database
 */
export const mockCreators: Record<string, Creator> = {
  sarah_designs: {
    username: "sarah_designs",
    name: "Sarah Chen",
    bio: "Digital artist and UI/UX designer. Creating beautiful interfaces and illustrations.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    followerCount: 15420,
    category: "Design",
    joinedDate: "2024-01-15",
    isVerified: true,
  },
  tech_mike: {
    username: "tech_mike",
    name: "Mike Rodriguez",
    bio: "Full-stack developer sharing coding tutorials and tech reviews.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    followerCount: 8930,
    category: "Technology",
    joinedDate: "2024-03-22",
    isVerified: true,
  },
  fitness_emma: {
    username: "fitness_emma",
    name: "Emma Thompson",
    bio: "Certified personal trainer. Helping you achieve your fitness goals! 💪",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    followerCount: 23100,
    category: "Fitness",
    joinedDate: "2023-11-08",
    isVerified: true,
  },
  chef_marco: {
    username: "chef_marco",
    name: "Marco Bianchi",
    bio: "Italian chef and food enthusiast. Sharing family recipes and cooking tips.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
    followerCount: 12650,
    category: "Food",
    joinedDate: "2024-02-10",
    isVerified: false,
  },
  music_alex: {
    username: "music_alex",
    name: "Alex Kim",
    bio: "Music producer and sound engineer. Electronic music and production tutorials.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    followerCount: 19200,
    category: "Music",
    joinedDate: "2023-12-03",
    isVerified: true,
  },
};
