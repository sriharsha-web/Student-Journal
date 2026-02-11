import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Clock,
  BookOpen,
  X,
  Bell,
} from 'lucide-react';
import { playAlarmSound, formatTimeRemaining } from '@/lib/alarm-utils';
import { cn } from '@/lib/utils';

interface RevisionSlot {
  id: string;
  subject: string;
  topics: string[];
  timeMinutes: number;
  timeRemaining: number;
  isRunning: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export default function Revision() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<RevisionSlot[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newTime, setNewTime] = useState('30');
  const [newTopic, setNewTopic] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Load slots from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`studytogether_revisions_${user.id}`);
    if (saved) {
      try {
        setSlots(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading revisions:', error);
      }
    }
  }, [user]);

  // Save slots to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`studytogether_revisions_${user.id}`, JSON.stringify(slots));
    }
  }, [slots, user]);

  // Timer effect
  useEffect(() => {
    const timers = slots.map((slot) => {
      if (slot.isRunning && slot.timeRemaining > 0) {
        return setInterval(() => {
          setSlots((prevSlots) =>
            prevSlots.map((s) => {
              if (s.id === slot.id) {
                const newTime = s.timeRemaining - 1000;
                if (newTime <= 0) {
                  // Time's up - trigger alarm
                  playAlarmSound();
                  showNotification(`Time's up for ${s.subject}!`);
                  return { ...s, timeRemaining: 0, isRunning: false, isCompleted: true };
                }
                return { ...s, timeRemaining: newTime };
              }
              return s;
            })
          );
        }, 1000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, [slots]);

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Reminder', {
        body: message,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
      });
    }
  };

  const addSlot = () => {
    if (!newSubject.trim() || !newTime) {
      alert('Please fill in all fields');
      return;
    }

    const slot: RevisionSlot = {
      id: `revision_${Date.now()}`,
      subject: newSubject,
      topics: newTopic.trim() ? [newTopic.trim()] : [],
      timeMinutes: parseInt(newTime),
      timeRemaining: parseInt(newTime) * 60 * 1000,
      isRunning: false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setSlots([...slots, slot]);
    setNewSubject('');
    setNewTime('30');
    setNewTopic('');
    setShowForm(false);
  };

  const toggleTimer = (slotId: string) => {
    setSlots(
      slots.map((s) =>
        s.id === slotId && s.timeRemaining > 0
          ? { ...s, isRunning: !s.isRunning }
          : s
      )
    );
  };

  const resetSlot = (slotId: string) => {
    setSlots(
      slots.map((s) =>
        s.id === slotId
          ? {
              ...s,
              timeRemaining: s.timeMinutes * 60 * 1000,
              isRunning: false,
              isCompleted: false,
            }
          : s
      )
    );
  };

  const deleteSlot = (slotId: string) => {
    setSlots(slots.filter((s) => s.id !== slotId));
  };

  const addTopic = (slotId: string, topic: string) => {
    if (!topic.trim()) return;
    setSlots(
      slots.map((s) =>
        s.id === slotId && !s.topics.includes(topic.trim())
          ? { ...s, topics: [...s.topics, topic.trim()] }
          : s
      )
    );
  };

  const removeTopic = (slotId: string, topic: string) => {
    setSlots(
      slots.map((s) =>
        s.id === slotId
          ? { ...s, topics: s.topics.filter((t) => t !== topic) }
          : s
      )
    );
  };

  const getProgressPercentage = (slot: RevisionSlot) => {
    return Math.round(
      ((slot.timeMinutes * 60 * 1000 - slot.timeRemaining) /
        (slot.timeMinutes * 60 * 1000)) *
        100
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Revision Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Master your subjects with timed revision sessions
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Session
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="glass-lg p-6 rounded-2xl space-y-4 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  New Session
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    min="1"
                    max="180"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    First Topic (optional)
                  </label>
                  <Input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g., Chapter 5"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <Button
                  onClick={addSlot}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start Session
                </Button>
              </div>
            </div>
          )}

          {/* Sessions */}
          <div className={showForm ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {slots.length === 0 ? (
              <Card className="glass-lg p-12 rounded-2xl text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No revision sessions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first revision session to get started
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Session
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <Card key={slot.id} className="glass-lg p-6 rounded-2xl">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      {/* Left side - Subject & Topics */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {slot.subject}
                        </h3>

                        {/* Topics */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Topics
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {slot.topics.map((topic, idx) => (
                              <div
                                key={idx}
                                className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                              >
                                <span className="text-gray-900 dark:text-white">{topic}</span>
                                <button
                                  onClick={() => removeTopic(slot.id, topic)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add topic */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add topic..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  addTopic(slot.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="flex-1 px-2 py-1 text-sm bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded"
                            />
                            <Button
                              onClick={(e) => {
                                const input = (
                                  e.currentTarget.parentElement?.querySelector('input')
                                ) as HTMLInputElement;
                                if (input?.value.trim()) {
                                  addTopic(slot.id, input.value);
                                  input.value = '';
                                }
                              }}
                              size="sm"
                              className="px-2"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Timer */}
                      <div className="flex flex-col items-center gap-4">
                        {/* Timer Display */}
                        <div className="text-center">
                          <div
                            className={cn(
                              'text-5xl font-black font-mono smooth-transition',
                              slot.isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : slot.isRunning
                                  ? 'text-purple-600 dark:text-purple-400 animate-pulse'
                                  : 'text-gray-900 dark:text-white'
                            )}
                          >
                            {formatTimeRemaining(slot.timeRemaining)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {slot.timeMinutes} minutes
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 smooth-transition"
                              style={{ width: `${getProgressPercentage(slot)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => toggleTimer(slot.id)}
                            disabled={slot.timeRemaining <= 0}
                            className={cn(
                              'gap-2',
                              slot.isRunning
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            )}
                          >
                            {slot.isRunning ? (
                              <>
                                <Pause className="w-4 h-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Start
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => resetSlot(slot.id)}
                            variant="outline"
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                          </Button>

                          <Button
                            onClick={() => deleteSlot(slot.id)}
                            variant="outline"
                            className="text-red-500 hover:text-red-600 gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {slot.isCompleted && (
                          <div className="w-full bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Time completed!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
