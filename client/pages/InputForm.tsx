import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Subject, StudyInput } from "@shared/api";
import { Plus, X, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InputForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("4");
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Mathematics", topics: [] },
  ]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [newTopic, setNewTopic] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const currentSubject = subjects[currentSubjectIndex];

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: `Subject ${subjects.length + 1}`,
      topics: [],
    };
    setSubjects([...subjects, newSubject]);
    setCurrentSubjectIndex(subjects.length);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
      if (currentSubjectIndex >= newSubjects.length) {
        setCurrentSubjectIndex(newSubjects.length - 1);
      }
    }
  };

  const updateSubjectName = (index: number, name: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].name = name;
    setSubjects(newSubjects);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      const newSubjects = [...subjects];
      newSubjects[currentSubjectIndex].topics.push(newTopic.trim());
      setSubjects(newSubjects);
      setNewTopic("");
    }
  };

  const removeTopic = (topicIndex: number) => {
    const newSubjects = [...subjects];
    newSubjects[currentSubjectIndex].topics = newSubjects[
      currentSubjectIndex
    ].topics.filter((_, i) => i !== topicIndex);
    setSubjects(newSubjects);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!title.trim()) {
      newErrors.push("Please enter a plan title");
    }
    if (!deadline) {
      newErrors.push("Please select a deadline");
    } else {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        newErrors.push("Deadline must be in the future");
      }
    }
    if (!hoursPerDay || parseFloat(hoursPerDay) <= 0) {
      newErrors.push("Please enter valid study hours per day");
    }
    if (subjects.every((s) => s.topics.length === 0)) {
      newErrors.push("Please add at least one topic to study");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const input: StudyInput = {
        title,
        deadline,
        hoursPerDay: parseFloat(hoursPerDay),
        subjects: subjects.filter((s) => s.topics.length > 0),
      };
      localStorage.setItem("studyInput", JSON.stringify(input));
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Study Planner
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-2">
            Stop procrastinating. Start learning with an AI-powered study plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan Title */}
          <Card className="p-4 sm:p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Plan Title
            </label>
            <Input
              type="text"
              placeholder="e.g., Finals Preparation, College Entrance Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Give your study plan a meaningful name
            </p>
          </Card>

          {/* Deadline & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Deadline
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select your exam or deadline date
              </p>
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Daily Study Hours
              </label>
              <Input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="4"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How many hours can you study daily?
              </p>
            </Card>
          </div>

          {/* Subjects and Topics */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subjects & Topics
              </h2>
              <Button
                type="button"
                onClick={addSubject}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </div>

            {/* Subject Tabs */}
            <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {subjects.map((subject, index) => (
                <div
                  key={subject.id}
                  onClick={() => setCurrentSubjectIndex(index)}
                  className={cn(
                    "px-2 sm:px-4 py-2 cursor-pointer border-b-2 transition-colors relative group whitespace-nowrap text-sm sm:text-base flex items-center gap-1 sm:gap-2",
                    currentSubjectIndex === index
                      ? "border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
                  )}
                >
                  {subject.name}
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSubject(index);
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Subject Edit */}
            <Card className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Subject Name
                </label>
                <Input
                  type="text"
                  value={currentSubject.name}
                  onChange={(e) =>
                    updateSubjectName(currentSubjectIndex, e.target.value)
                  }
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Topics ({currentSubject.topics.length})
                </label>

                {/* Topic Input */}
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTopic();
                      }
                    }}
                    placeholder="e.g., Quadratic Equations, Calculus"
                  />
                  <Button
                    type="button"
                    onClick={addTopic}
                    className="whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Topics List */}
                <div className="space-y-2">
                  {currentSubject.topics.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No topics added yet. Add topics to get started.
                    </p>
                  ) : (
                    currentSubject.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {topic}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTopic(index)}
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="font-semibold text-red-900 dark:text-red-200 mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li
                    key={index}
                    className="text-sm text-red-800 dark:text-red-300"
                  >
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold gap-2 py-6"
          >
            Generate My Study Plan
            <ChevronRight className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
