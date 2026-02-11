import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudyInput, StudyPlan } from "@shared/api";
import {
  generateStudyPlan,
  updateTaskCompletion,
  rescheduleForStress,
} from "@/lib/study-planner";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  RotateCcw,
  Zap,
  Home,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StressLevel = "low" | "medium" | "high";

export default function Dashboard() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [stressLevel, setStressLevel] = useState<StressLevel>("medium");
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { requestPermission, sendTaskReminder, sendCompletionNotification } =
    useNotifications();

  useEffect(() => {
    // Load or generate study plan
    const savedPlan = localStorage.getItem("studyPlan");
    const savedInput = localStorage.getItem("studyInput");

    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
      const savedStress = localStorage.getItem("stressLevel") as StressLevel;
      if (savedStress) {
        setStressLevel(savedStress);
      }
    } else if (savedInput) {
      const input: StudyInput = JSON.parse(savedInput);
      const newPlan = generateStudyPlan(input);
      setPlan(newPlan);
      localStorage.setItem("studyPlan", JSON.stringify(newPlan));
    } else {
      navigate("/");
    }
    setLoading(false);
  }, [navigate]);

  const handleTaskToggle = (dayIndex: number, taskIndex: number) => {
    if (plan) {
      const task = plan.days[dayIndex].tasks[taskIndex];
      const updatedPlan = updateTaskCompletion(
        plan,
        dayIndex,
        taskIndex,
        !task.completed,
      );
      setPlan(updatedPlan);
      localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));

      // Send notifications
      if (notificationsEnabled) {
        if (!task.completed) {
          const remainingTasks = updatedPlan.days[dayIndex].tasks.filter(
            (t) => !t.completed,
          ).length;
          if (remainingTasks === 0) {
            sendCompletionNotification();
          } else {
            sendTaskReminder(remainingTasks);
          }
        }
      }
    }
  };

  const handleStressChange = (newStress: StressLevel) => {
    if (plan) {
      setStressLevel(newStress);
      const rescheduledPlan = rescheduleForStress(plan, newStress);
      setPlan(rescheduledPlan);
      localStorage.setItem("studyPlan", JSON.stringify(rescheduledPlan));
      localStorage.setItem("stressLevel", newStress);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will reset all progress.")) {
      const savedInput = localStorage.getItem("studyInput");
      if (savedInput) {
        const input: StudyInput = JSON.parse(savedInput);
        const newPlan = generateStudyPlan(input);
        setPlan(newPlan);
        localStorage.setItem("studyPlan", JSON.stringify(newPlan));
      }
    }
  };

  const handleNewPlan = () => {
    localStorage.removeItem("studyPlan");
    localStorage.removeItem("studyInput");
    localStorage.removeItem("stressLevel");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Generating your study plan...
          </p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const currentDay = plan.days[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-8 w-8 flex-shrink-0"
              >
                <Home className="w-4 h-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {plan.input.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-10 truncate">
              Overall Progress: {plan.overallCompletionPercentage}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const granted = await requestPermission();
                setNotificationsEnabled(granted);
              }}
              className={cn(
                "hidden sm:flex gap-2",
                notificationsEnabled
                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                  : "",
              )}
            >
              <Bell className="w-4 h-4" />
              {notificationsEnabled
                ? "Notifications On"
                : "Enable Notifications"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="hidden sm:flex gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewPlan}
              className="hidden sm:flex gap-2"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Day Navigator */}
          <div className="lg:col-span-1">
            <Card className="p-3 sm:p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Study Days ({plan.days.length})
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {plan.days.map((day, index) => {
                  const isSelected = index === selectedDay;
                  const completedCount = day.tasks.filter(
                    (t) => t.completed,
                  ).length;
                  const totalCount = day.tasks.length;

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(index)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors",
                        isSelected
                          ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-500 dark:border-purple-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        Day {day.dayNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {completedCount}/{totalCount} tasks
                      </div>
                      <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${day.completionPercentage}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Day Overview */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Day {currentDay.dayNumber}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {new Date(currentDay.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentDay.totalMinutes} mins
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentDay.completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                    style={{ width: `${currentDay.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Stress Level Control */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Stress Level
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Adjust if you're feeling overwhelmed
                  </p>
                </div>

                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleStressChange(level)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all capitalize",
                        stressLevel === level
                          ? level === "low"
                            ? "bg-green-500 text-white"
                            : level === "medium"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Tasks List */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-base sm:text-lg">
                Today's Tasks
              </h3>

              {currentDay.tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No tasks for this day. Great job staying ahead!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDay.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer",
                        task.completed
                          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600",
                      )}
                      onClick={() => handleTaskToggle(selectedDay, taskIndex)}
                    >
                      <button className="flex-shrink-0 mt-1">
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium transition-all",
                            task.completed
                              ? "text-gray-500 dark:text-gray-400 line-through"
                              : "text-gray-900 dark:text-white",
                          )}
                        >
                          {task.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            {task.duration} mins
                          </span>
                          <span className="inline-flex items-center text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded capitalize">
                            {task.taskType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-center sm:justify-end flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const granted = await requestPermission();
                  setNotificationsEnabled(granted);
                }}
                className={cn(
                  "gap-2 sm:hidden",
                  notificationsEnabled
                    ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                    : "",
                )}
              >
                <Bell className="w-4 h-4" />
                {notificationsEnabled ? "On" : "Notify"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 sm:hidden"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewPlan}
                className="gap-2 sm:hidden"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
