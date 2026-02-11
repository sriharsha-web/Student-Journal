import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentStep {
  id: string;
  title: string;
  completed: boolean;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  steps: AssignmentStep[];
  createdAt: string;
}

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    deadline: "",
  });

  // Load assignments from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`studytogether_assignments_${user.id}`);
    if (saved) setAssignments(JSON.parse(saved));
  }, [user]);

  // Save assignments to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `studytogether_assignments_${user.id}`,
        JSON.stringify(assignments),
      );
    }
  }, [assignments, user]);

  const generateSteps = (description: string): AssignmentStep[] => {
    const defaultSteps = [
      { id: "1", title: "Research & Gather Resources", completed: false },
      { id: "2", title: "Create Outline", completed: false },
      { id: "3", title: "First Draft", completed: false },
      { id: "4", title: "Review & Edit", completed: false },
      { id: "5", title: "Final Review", completed: false },
      { id: "6", title: "Submit", completed: false },
    ];
    return defaultSteps;
  };

  const addAssignment = () => {
    if (!formData.title || !formData.subject || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    const newAssignment: Assignment = {
      id: `assign_${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      deadline: formData.deadline,
      steps: generateSteps(formData.description),
      createdAt: new Date().toISOString(),
    };

    setAssignments([...assignments, newAssignment]);
    setFormData({ title: "", subject: "", description: "", deadline: "" });
    setShowForm(false);
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const toggleStep = (assignmentId: string, stepId: string) => {
    setAssignments(
      assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              steps: a.steps.map((s) =>
                s.id === stepId ? { ...s, completed: !s.completed } : s,
              ),
            }
          : a,
      ),
    );
  };

  const getProgress = (assignment: Assignment) => {
    const completed = assignment.steps.filter((s) => s.completed).length;
    return Math.round((completed / assignment.steps.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and complete your assignments
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="glass-lg p-6 rounded-2xl space-y-4 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  New Assignment
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Assignment title"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Math, English, etc."
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="What is this assignment about?"
                    className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Deadline
                  </label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <Button
                  onClick={addAssignment}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </Button>
              </div>
            </div>
          )}

          {/* Assignments List */}
          <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
            {assignments.length === 0 ? (
              <Card className="glass-lg p-12 rounded-2xl text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No assignments yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first assignment to get started
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Assignment
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const progress = getProgress(assignment);
                  const completed = assignment.steps.filter(
                    (s) => s.completed,
                  ).length;

                  return (
                    <Card
                      key={assignment.id}
                      className="glass-lg p-6 rounded-2xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
                              {assignment.subject}
                            </span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                assignment.deadline,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {assignment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {assignment.description}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 smooth-transition"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Steps ({completed}/{assignment.steps.length})
                        </p>
                        {assignment.steps.map((step) => (
                          <div
                            key={step.id}
                            onClick={() => toggleStep(assignment.id, step.id)}
                            className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover-lift text-sm"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <span
                              className={cn(
                                "flex-1",
                                step.completed &&
                                  "line-through text-gray-500 dark:text-gray-400",
                              )}
                            >
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
