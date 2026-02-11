import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Animated background elements */}
          <div className="absolute top-0 left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

          <div className="relative z-10 text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                AI-Powered Study Planner
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Stop Procrastinating.
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Start Learning.
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Create a personalized day-wise study plan powered by AI. Break
              down your entire syllabus into manageable 20-45 minute
              micro-tasks. Never feel overwhelmed again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate("/input")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold gap-2 px-8 py-6 rounded-lg"
              >
                Create My Plan Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-lg font-semibold px-8 py-6 rounded-lg"
              >
                Learn More
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No Sign Up Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Works Offline</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Smart Planning",
                description:
                  "AI breaks down your syllabus into optimized daily tasks. No more guesswork.",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Realistic Timelines",
                description:
                  "Each task is 20-45 mins. Study with focus. Study without burnout.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Track Progress",
                description:
                  "See your daily completion percentage. Stay motivated with visual progress.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Stress Relief",
                description:
                  "Feeling overwhelmed? Adjust stress level and reschedule intelligently.",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "AI Enhancements",
                description:
                  "Optional AI rewrites tasks in a motivating tone. Stay inspired.",
              },
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "Dark Mode",
                description:
                  "Eye-friendly dark mode. Study anytime, anywhere comfortably.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Tell Us Your Syllabus",
                  description:
                    "Add subjects and topics. Be specific about what you need to study.",
                },
                {
                  step: "2",
                  title: "Set Your Deadline",
                  description:
                    "Tell us when your exam is. We calculate available days.",
                },
                {
                  step: "3",
                  title: "Get Your Plan",
                  description:
                    "AI generates a day-wise plan with micro-tasks. Ready to go!",
                },
                {
                  step: "4",
                  title: "Track & Adjust",
                  description:
                    "Check tasks as done. Adjust stress level if needed. Stay consistent.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                  {index < 3 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-4 md:mt-6 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to ace your exams?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Create your personalized study plan in less than 2 minutes.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/input")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold gap-2 px-8 py-6 rounded-lg"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-800 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Built with <span className="text-red-500">❤</span> for students who
            want to succeed.
          </p>
          <p className="mt-2">
            Your data is stored locally on your device. No servers, no tracking,
            no ads.
          </p>
        </div>
      </footer>
    </div>
  );
}
