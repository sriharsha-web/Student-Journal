import { StudyInput, StudyPlan, DayPlan, MicroTask } from "@shared/api";

/**
 * Planning Logic for Study Planner
 * Generates day-wise micro-tasks based on syllabus and deadline
 */

const TASK_TEMPLATES = {
  reading: [
    (topic: string, duration: number) =>
      `Read about ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `Study topic: ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `Review notes on ${topic} (${duration} mins)`,
  ],
  video: [
    (topic: string, duration: number) =>
      `Watch video on ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `Learning: ${topic} via video (${duration} mins)`,
  ],
  practice: [
    (topic: string, duration: number) =>
      `Solve 5-10 practice questions on ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `Practice problems: ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `MCQ practice on ${topic} (${duration} mins)`,
  ],
  revision: [
    (topic: string, duration: number) => `Revise ${topic} (${duration} mins)`,
    (topic: string, duration: number) =>
      `Quick revision: ${topic} (${duration} mins)`,
  ],
};

function generateTaskContent(
  topic: string,
  taskType: "reading" | "video" | "practice" | "revision",
): string {
  const templates = TASK_TEMPLATES[taskType];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const randomDuration =
    taskType === "reading"
      ? 20 + Math.random() * 10
      : taskType === "video"
        ? 15 + Math.random() * 15
        : taskType === "practice"
          ? 15 + Math.random() * 20
          : 10 + Math.random() * 10;
  return template(topic, Math.round(randomDuration));
}

export function generateStudyPlan(input: StudyInput): StudyPlan {
  const now = new Date();
  const deadline = new Date(input.deadline);
  const totalDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays <= 0) {
    throw new Error("Deadline must be in the future");
  }

  // Collect all topics
  const allTopics: Array<{ subject: string; topic: string }> = [];
  input.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      allTopics.push({ subject: subject.name, topic });
    });
  });

  const totalTopics = allTopics.length;
  if (totalTopics === 0) {
    throw new Error("Please add at least one topic");
  }

  // Calculate available minutes per day
  const availableMinutesPerDay = input.hoursPerDay * 60;

  // Generate days
  const days: DayPlan[] = [];
  let topicIndex = 0;

  for (let dayNum = 0; dayNum < totalDays; dayNum++) {
    const currentDate = new Date(now);
    currentDate.setDate(currentDate.getDate() + dayNum);

    const tasks: MicroTask[] = [];
    let dayMinutes = 0;
    const taskTypes: Array<"reading" | "video" | "practice" | "revision"> = [
      "reading",
      "video",
      "practice",
      "revision",
    ];

    // Distribute topics across days
    const topicsPerDay = Math.ceil(totalTopics / totalDays);
    const topicsForDay = Math.min(topicsPerDay, allTopics.length - topicIndex);

    for (let i = 0; i < topicsForDay; i++) {
      if (topicIndex >= allTopics.length) break;

      const { topic } = allTopics[topicIndex];

      // Vary task types throughout the day (reading -> video -> practice)
      const taskType = taskTypes[i % taskTypes.length];

      // Random duration between 10-45 minutes
      const duration = 15 + Math.floor(Math.random() * 30);

      // Don't exceed daily hours
      if (dayMinutes + duration <= availableMinutesPerDay) {
        const taskContent = generateTaskContent(topic, taskType);

        tasks.push({
          id: `task-${dayNum}-${i}`,
          content: taskContent,
          duration,
          completed: false,
          taskType,
        });

        dayMinutes += duration;
        topicIndex++;
      }
    }

    // Ensure at least one task per day if there are topics left
    if (tasks.length === 0 && topicIndex < allTopics.length) {
      const { topic } = allTopics[topicIndex];
      const taskType = taskTypes[0];
      const duration = Math.min(30, availableMinutesPerDay);

      tasks.push({
        id: `task-${dayNum}-0`,
        content: generateTaskContent(topic, taskType),
        duration,
        completed: false,
        taskType,
      });

      topicIndex++;
    }

    // If no tasks for this day, continue to next day
    if (tasks.length > 0) {
      days.push({
        date: currentDate.toISOString().split("T")[0],
        dayNumber: dayNum + 1,
        tasks,
        totalMinutes: dayMinutes,
        completedMinutes: 0,
        completionPercentage: 0,
      });
    }
  }

  const plan: StudyPlan = {
    id: `plan-${Date.now()}`,
    input,
    days: days.filter((d) => d.tasks.length > 0), // Remove empty days
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    stressLevel: "medium",
    overallCompletionPercentage: 0,
  };

  return plan;
}

export function updateTaskCompletion(
  plan: StudyPlan,
  dayIndex: number,
  taskIndex: number,
  completed: boolean,
): StudyPlan {
  const updatedPlan = JSON.parse(JSON.stringify(plan)) as StudyPlan;

  if (dayIndex >= 0 && dayIndex < updatedPlan.days.length) {
    const day = updatedPlan.days[dayIndex];
    if (taskIndex >= 0 && taskIndex < day.tasks.length) {
      day.tasks[taskIndex].completed = completed;

      // Recalculate day stats
      let completedMinutes = 0;
      day.tasks.forEach((task) => {
        if (task.completed) {
          completedMinutes += task.duration;
        }
      });

      day.completedMinutes = completedMinutes;
      day.completionPercentage = Math.round(
        (completedMinutes / day.totalMinutes) * 100,
      );
    }
  }

  // Recalculate overall completion
  let totalCompletedMinutes = 0;
  let totalMinutes = 0;
  updatedPlan.days.forEach((day) => {
    totalCompletedMinutes += day.completedMinutes;
    totalMinutes += day.totalMinutes;
  });

  updatedPlan.overallCompletionPercentage =
    totalMinutes > 0
      ? Math.round((totalCompletedMinutes / totalMinutes) * 100)
      : 0;
  updatedPlan.lastUpdated = new Date().toISOString();

  return updatedPlan;
}

export function rescheduleForStress(
  plan: StudyPlan,
  stressLevel: "low" | "medium" | "high",
): StudyPlan {
  const updatedPlan = JSON.parse(JSON.stringify(plan)) as StudyPlan;
  updatedPlan.stressLevel = stressLevel;

  if (stressLevel === "high") {
    // Reduce daily workload by 30-40%
    const reductionFactor = 0.6; // Keep 60% of tasks

    // Collect all incomplete tasks
    const incompleteTasks: Array<{
      dayIndex: number;
      taskIndex: number;
      task: MicroTask;
    }> = [];
    updatedPlan.days.forEach((day, dayIndex) => {
      day.tasks.forEach((task, taskIndex) => {
        if (!task.completed) {
          incompleteTasks.push({ dayIndex, taskIndex, task });
        }
      });
    });

    // Clear tasks and redistribute
    updatedPlan.days.forEach((day) => {
      day.tasks = day.tasks.filter((task) => task.completed);
      day.totalMinutes = day.tasks.reduce((sum, t) => sum + t.duration, 0);
      day.completionPercentage = day.totalMinutes > 0 ? 100 : 0;
    });

    // Redistribute incomplete tasks
    const totalDays = updatedPlan.days.length;
    let taskIndex = 0;

    for (
      let dayIdx = 0;
      dayIdx < totalDays && taskIndex < incompleteTasks.length;
      dayIdx++
    ) {
      const day = updatedPlan.days[dayIdx];
      const availableSpace =
        plan.input.hoursPerDay * 60 * reductionFactor - day.totalMinutes;

      while (taskIndex < incompleteTasks.length && availableSpace > 0) {
        const { task } = incompleteTasks[taskIndex];
        if (task.duration <= availableSpace) {
          day.tasks.push(task);
          day.totalMinutes += task.duration;
          taskIndex++;
        } else {
          break;
        }
      }
    }

    // Add remaining tasks to the last day(s)
    while (taskIndex < incompleteTasks.length) {
      const lastDay = updatedPlan.days[updatedPlan.days.length - 1];
      const { task } = incompleteTasks[taskIndex];
      lastDay.tasks.push(task);
      lastDay.totalMinutes += task.duration;
      taskIndex++;
    }
  }

  updatedPlan.lastUpdated = new Date().toISOString();
  return updatedPlan;
}
