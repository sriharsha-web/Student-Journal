import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  topics: string[];
}

interface Task {
  id: string;
  content: string;
  duration: number;
  completed: boolean;
  type: 'reading' | 'video' | 'practice' | 'revision';
  date: string;
}

export default function Planner() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [newTopic, setNewTopic] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('4');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  // Load data from localStorage
  useEffect(() => {
    if (!user) return;

    const savedTasks = localStorage.getItem(`studytogether_tasks_${user.id}`);
    const savedSubjects = localStorage.getItem(`studytogether_subjects_${user.id}`);

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSubjects) {
      const subs = JSON.parse(savedSubjects);
      setSubjects(subs);
    } else if (subjects.length === 0) {
      setSubjects([{ id: '1', name: 'Math', topics: [] }]);
    }
  }, [user]);

  // Save tasks to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`studytogether_tasks_${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Save subjects to localStorage
  useEffect(() => {
    if (user && subjects.length > 0) {
      localStorage.setItem(`studytogether_subjects_${user.id}`, JSON.stringify(subjects));
    }
  }, [subjects, user]);

  const currentSubject = subjects[currentSubjectIndex];

  const addTopic = () => {
    if (!newTopic.trim() || !currentSubject) return;

    const newSubjects = [...subjects];
    newSubjects[currentSubjectIndex].topics.push(newTopic);
    setSubjects(newSubjects);
    setNewTopic('');
  };

  const removeTopic = (topicIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[currentSubjectIndex].topics = newSubjects[currentSubjectIndex].topics.filter(
      (_, i) => i !== topicIndex
    );
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: `Subject ${subjects.length + 1}`,
      topics: [],
    };
    setSubjects([...subjects, newSubject]);
    setCurrentSubjectIndex(subjects.length);
  };

  const updateSubjectName = (subjectId: string, newName: string) => {
    const newSubjects = subjects.map((s) =>
      s.id === subjectId ? { ...s, name: newName } : s
    );
    setSubjects(newSubjects);
    setEditingSubjectId(null);
    setEditingSubjectName('');
  };

  const deleteSubject = (index: number) => {
    if (subjects.length <= 1) {
      alert('You must have at least one subject');
      return;
    }
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
    if (currentSubjectIndex >= newSubjects.length) {
      setCurrentSubjectIndex(newSubjects.length - 1);
    }
  };

  const generatePlan = () => {
    if (!deadline || subjects.every((s) => s.topics.length === 0)) {
      alert('Please add subjects/topics and set a deadline');
      return;
    }

    const allTopics = subjects.flatMap((s) => s.topics);
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      alert('Deadline must be in the future');
      return;
    }

    const taskTypes: Array<'reading' | 'video' | 'practice' | 'revision'> = [
      'reading',
      'video',
      'practice',
      'revision',
    ];

    const newTasks: Task[] = [];
    let topicIndex = 0;

    for (let day = 0; day < daysLeft; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      let dayMinutes = 0;
      const availableMinutes = parseInt(hoursPerDay) * 60;

      while (topicIndex < allTopics.length && dayMinutes < availableMinutes) {
        const topic = allTopics[topicIndex];
        const type = taskTypes[topicIndex % taskTypes.length];
        const duration = Math.min(30, availableMinutes - dayMinutes);

        newTasks.push({
          id: `task_${Date.now()}_${topicIndex}`,
          content: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${topic}`,
          duration,
          completed: false,
          type,
          date: dateStr,
        });

        dayMinutes += duration;
        topicIndex++;

        if (topicIndex >= allTopics.length) break;
      }

      if (topicIndex >= allTopics.length) break;
    }

    setTasks(newTasks);
    setShowForm(false);
    alert('Study plan generated successfully!');
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const tasksByDate = tasks.reduce(
    (acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const sortedDates = Object.keys(tasksByDate).sort();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasksByDate[todayStr] || [];
  const completedToday = todayTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Study Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your study schedule
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="glass-lg p-6 rounded-2xl space-y-4 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  New Plan
                </h2>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Deadline
                  </label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                {/* Hours per day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Hours/Day
                  </label>
                  <Input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    min="1"
                    max="12"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Subjects
                  </label>
                  <div className="space-y-2">
                    {subjects.map((subject, idx) => (
                      <div key={subject.id} className="flex gap-2 group">
                        {editingSubjectId === subject.id ? (
                          <>
                            <input
                              type="text"
                              value={editingSubjectName}
                              onChange={(e) => setEditingSubjectName(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/20"
                              autoFocus
                            />
                            <Button
                              onClick={() => updateSubjectName(subject.id, editingSubjectName)}
                              size="sm"
                              className="px-2"
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setCurrentSubjectIndex(idx)}
                              className={cn(
                                'flex-1 px-3 py-2 rounded-lg text-sm smooth-transition text-left',
                                currentSubjectIndex === idx
                                  ? 'glass bg-purple-500/20 dark:bg-purple-500/30 border border-purple-300/50'
                                  : 'glass hover:bg-white/30 dark:hover:bg-white/20'
                              )}
                            >
                              {subject.name}
                            </button>
                            <Button
                              onClick={() => {
                                setEditingSubjectId(subject.id);
                                setEditingSubjectName(subject.name);
                              }}
                              size="sm"
                              variant="outline"
                              className="px-2 opacity-0 group-hover:opacity-100"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteSubject(idx)}
                              size="sm"
                              variant="outline"
                              className="px-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addSubject}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </Button>
                </div>

                {/* Topics */}
                {currentSubject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Topics ({currentSubject.topics.length})
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTopic();
                          }
                        }}
                        placeholder="Add topic..."
                        className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 text-sm"
                      />
                      <Button size="sm" onClick={addTopic} className="px-3">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {currentSubject.topics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg text-sm"
                        >
                          <span className="text-gray-900 dark:text-white">{topic}</span>
                          <button
                            onClick={() => removeTopic(idx)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={generatePlan}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
                >
                  Generate Plan
                </Button>
              </div>
            </div>
          )}

          {/* Tasks Section */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {todayTasks.length > 0 && (
              <Card className="glass-lg p-6 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Today's Tasks
                  </h2>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {completedToday}/{todayTasks.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">completed</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 smooth-transition"
                    style={{ width: `${(completedToday / todayTasks.length) * 100}%` }}
                  ></div>
                </div>

                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-4 p-4 glass rounded-xl cursor-pointer hover-lift"
                    >
                      <button className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'font-medium',
                            task.completed &&
                              'line-through text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {task.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {task.duration} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Upcoming days */}
            {sortedDates.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Schedule
                </h2>

                {sortedDates.map((date) => {
                  if (date === todayStr) return null;

                  const dayTasks = tasksByDate[date];
                  const completed = dayTasks.filter((t) => t.completed).length;

                  return (
                    <Card key={date} className="glass-lg p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {completed}/{dayTasks.length} done
                        </span>
                      </div>

                      <div className="space-y-2">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover-lift"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <span
                              className={cn(
                                'text-sm flex-1',
                                task.completed &&
                                  'line-through text-gray-500 dark:text-gray-400'
                              )}
                            >
                              {task.content}
                            </span>
                            <span className="text-xs text-gray-500">
                              {task.duration}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {tasks.length === 0 && !showForm && (
              <Card className="glass-lg p-12 rounded-2xl text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No study plan yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first study plan to get started
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Plan
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
