/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Study Planner Types
 */

export interface Subject {
  id: string;
  name: string;
  topics: string[]; // List of topics to study
}

export interface StudyInput {
  subjects: Subject[];
  deadline: string; // ISO date string
  hoursPerDay: number;
  title: string; // e.g., "Finals preparation", "College Entrance Exam"
}

export interface MicroTask {
  id: string;
  content: string; // e.g., "Read Chapter 5 (25 mins)"
  duration: number; // in minutes
  completed: boolean;
  taskType: "reading" | "video" | "practice" | "revision";
}

export interface DayPlan {
  date: string; // ISO date string
  dayNumber: number;
  tasks: MicroTask[];
  totalMinutes: number;
  completedMinutes: number;
  completionPercentage: number;
}

export interface StudyPlan {
  id: string;
  input: StudyInput;
  days: DayPlan[];
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  stressLevel: "low" | "medium" | "high";
  overallCompletionPercentage: number;
}

export interface StressRescheduleRequest {
  planId: string;
  stressLevel: "low" | "medium" | "high";
}

export interface TaskPhrasingResponse {
  original: string;
  rephrased: string;
}
