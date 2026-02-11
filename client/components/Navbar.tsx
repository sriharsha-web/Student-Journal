import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, BarChart3, FileText, Settings, LogOut, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Planner', icon: BookOpen, href: '/planner' },
    { label: 'Assignments', icon: FileText, href: '/assignments' },
    { label: 'Revision', icon: Clock, href: '/revision' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/planner')}
            className="flex items-center gap-3 cursor-pointer hover-scale"
          >
            <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xl font-bold hidden sm:inline rgb-gradient">
              STUDY TOGETHER
            </span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'px-4 py-2 rounded-lg flex items-center gap-2 font-medium smooth-transition',
                    isActive
                      ? 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 border border-purple-300/30 dark:border-purple-400/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>

            <Button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/40 border border-red-300/30 dark:border-red-400/30 gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 py-3 -mx-4 px-4 border-t border-white/20 dark:border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  'px-3 py-2 rounded-lg flex items-center gap-2 font-medium smooth-transition whitespace-nowrap text-sm',
                  isActive
                    ? 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
