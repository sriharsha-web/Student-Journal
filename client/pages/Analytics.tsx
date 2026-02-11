import { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const { user, isLoading } = useAuth();

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!user) {
      console.log('No user found in analytics');
      return null;
    }

    try {
      // Load and parse tasks
      let tasks = [];
      const tasksJson = localStorage.getItem(`studytogether_tasks_${user.id}`);
      if (tasksJson) {
        try {
          const parsed = JSON.parse(tasksJson);
          tasks = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
          console.error('Error parsing tasks JSON:', parseError);
          tasks = [];
        }
      }

      // Load and parse assignments
      let assignments = [];
      const assignmentsJson = localStorage.getItem(`studytogether_assignments_${user.id}`);
      if (assignmentsJson) {
        try {
          const parsed = JSON.parse(assignmentsJson);
          assignments = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
          console.error('Error parsing assignments JSON:', parseError);
          assignments = [];
        }
      }

      console.log('Loaded tasks:', tasks.length, 'assignments:', assignments.length);

      // Task completion pie chart
      const completedTasks = tasks.filter((t: any) => t.completed).length;
      const pendingTasks = tasks.length - completedTasks;

      // Tasks by day - with date validation
      const tasksByDay: Record<string, number> = {};
      const completedByDay: Record<string, number> = {};
      tasks.forEach((task: any) => {
        try {
          if (task.date) {
            const day = new Date(task.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            tasksByDay[day] = (tasksByDay[day] || 0) + 1;
            if (task.completed) {
              completedByDay[day] = (completedByDay[day] || 0) + 1;
            }
          }
        } catch (error) {
          console.error('Error processing task:', task, error);
        }
      });

      const barData = Object.keys(tasksByDay)
        .sort()
        .map((day) => ({
          day,
          completed: completedByDay[day] || 0,
          pending: tasksByDay[day] - (completedByDay[day] || 0),
        }));

      // Productivity trend (last 7 days)
      const trendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendData.push({
          date: dateStr,
          productivity: Math.floor(Math.random() * 40) + 60,
        });
      }

      // Task types distribution
      const typeData = [
        { name: 'Reading', value: tasks.filter((t: any) => t.type === 'reading').length },
        { name: 'Video', value: tasks.filter((t: any) => t.type === 'video').length },
        { name: 'Practice', value: tasks.filter((t: any) => t.type === 'practice').length },
        { name: 'Revision', value: tasks.filter((t: any) => t.type === 'revision').length },
      ].filter((t) => t.value > 0);

      // Subject distribution (from assignments)
      const subjectData = assignments.reduce(
        (acc: any, a: any) => {
          if (a && a.subject) {
            const existing = acc.find((s: any) => s.subject === a.subject);
            if (existing) {
              existing.assignments += 1;
            } else {
              acc.push({ subject: a.subject, assignments: 1 });
            }
          }
          return acc;
        },
        []
      );

      // Study consistency
      const consistencyData = [
        { day: 'Mon', hours: 4 },
        { day: 'Tue', hours: 3.5 },
        { day: 'Wed', hours: 5 },
        { day: 'Thu', hours: 4.5 },
        { day: 'Fri', hours: 3 },
        { day: 'Sat', hours: 6 },
        { day: 'Sun', hours: 2 },
      ];

      // Assignment analytics - with validation
      const assignmentCompletion = assignments
        .filter((a: any) => {
          const isValid = a && a.title && Array.isArray(a.steps) && a.steps.length > 0;
          if (!isValid && a) {
            console.log('Filtered out assignment:', a.title, 'steps:', a.steps);
          }
          return isValid;
        })
        .map((a: any) => {
          try {
            const completed = a.steps.filter((s: any) => s && s.completed).length;
            const progress = Math.round((completed / a.steps.length) * 100);
            console.log(`Assignment "${a.title}" progress:`, progress, `(${completed}/${a.steps.length})`);
            return {
              name: a.title.substring(0, 20),
              progress,
            };
          } catch (error) {
            console.error('Error calculating assignment progress:', a, error);
            return { name: a.title?.substring(0, 20) || 'Unknown', progress: 0 };
          }
        });

      // Count completed assignments - with validation
      const completedAssignments = assignments.filter((a: any) => {
        const isComplete = a && Array.isArray(a.steps) && a.steps.length > 0 &&
          a.steps.every((s: any) => s && s.completed);
        if (isComplete) {
          console.log('Completed assignment:', a.title);
        }
        return isComplete;
      }).length;

      console.log('Assignment analytics summary:', {
        totalAssignments: assignments.length,
        withValidSteps: assignmentCompletion.length,
        completed: completedAssignments,
        subjects: subjectData.length,
      });

      return {
        taskCompletion: [
          { name: 'Completed', value: completedTasks || 0 },
          { name: 'Pending', value: pendingTasks || 0 },
        ],
        barData: barData.length > 0 ? barData : [{ day: 'No data', completed: 0, pending: 0 }],
        trendData,
        typeData,
        subjectData,
        consistencyData,
        assignmentCompletion,
        stats: {
          totalTasks: tasks.length || 0,
          completedTasks: completedTasks || 0,
          completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
          totalAssignments: assignments.length || 0,
          completedAssignments: completedAssignments || 0,
        },
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {
        taskCompletion: [
          { name: 'Completed', value: 0 },
          { name: 'Pending', value: 0 },
        ],
        barData: [],
        trendData: [],
        typeData: [],
        subjectData: [],
        consistencyData: [],
        assignmentCompletion: [],
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          totalAssignments: 0,
          completedAssignments: 0,
        },
      };
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Loading your analytics...</p>
            {!analytics && !isLoading && (
              <Card className="glass-lg p-12 rounded-2xl">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No analytics data available yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Create a study plan in the Planner to see your analytics.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Check if there's any data at all
  const hasAnyData = analytics && (
    (analytics.stats.totalTasks > 0 || analytics.stats.totalAssignments > 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your study progress and productivity
          </p>
          {!hasAnyData && analytics && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 Create a study plan in the Planner to start tracking your analytics.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-lg p-6 rounded-2xl hover:shadow-lg smooth-transition">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {analytics?.stats?.totalTasks ?? 0}
            </p>
          </Card>
          <Card className="glass-lg p-6 rounded-2xl hover:shadow-lg smooth-transition">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {analytics?.stats?.completedTasks ?? 0}
            </p>
          </Card>
          <Card className="glass-lg p-6 rounded-2xl hover:shadow-lg smooth-transition">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analytics?.stats?.completionRate ?? 0}%
            </p>
          </Card>
          <Card className="glass-lg p-6 rounded-2xl hover:shadow-lg smooth-transition">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Assignments</p>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {analytics?.stats?.totalAssignments ?? 0}
            </p>
          </Card>
          <Card className="glass-lg p-6 rounded-2xl hover:shadow-lg smooth-transition">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {analytics?.stats?.completedAssignments ?? 0}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart - Task Completion */}
          {analytics.taskCompletion[0].value > 0 || analytics.taskCompletion[1].value > 0 ? (
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Task Completion Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.taskCompletion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.taskCompletion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          ) : null}

          {/* Bar Chart - Tasks by Day */}
          {analytics.barData.length > 0 ? (
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tasks Completed by Day
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(100,100,100,0.5)" />
                  <YAxis stroke="rgba(100,100,100,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 30, 46, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ) : null}

          {/* Line Chart - Productivity Trend */}
          <Card className="glass-lg p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Productivity Trend (7 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="date" stroke="rgba(100,100,100,0.5)" />
                <YAxis stroke="rgba(100,100,100,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 46, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Doughnut - Task Types */}
          {analytics.typeData.length > 0 && (
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Task Types Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Area Chart - Study Consistency */}
          <Card className="glass-lg p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Study Hours
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.consistencyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="day" stroke="rgba(100,100,100,0.5)" />
                <YAxis stroke="rgba(100,100,100,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 46, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar - Subject Performance */}
          {analytics.subjectData.length > 0 && (
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Subject Workload Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analytics.subjectData}>
                  <PolarGrid stroke="rgba(100,100,100,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(100,100,100,0.5)" />
                  <PolarRadiusAxis stroke="rgba(100,100,100,0.5)" />
                  <Radar
                    name="Assignments"
                    dataKey="assignments"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Assignment Progress */}
          {analytics.assignmentCompletion.length > 0 && (
            <Card className="glass-lg p-6 rounded-2xl lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Assignment Progress
              </h2>
              <div className="space-y-4">
                {analytics.assignmentCompletion.map((assignment, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {assignment.name}
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {assignment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 smooth-transition"
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
