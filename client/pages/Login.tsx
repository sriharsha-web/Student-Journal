import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Mail, Lock, User, Sparkles } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/planner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-slideDown">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full glass-lg flex items-center justify-center hover-scale">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="rgb-gradient">STUDY TOGETHER</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Learn together, grow together
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-lg p-8 rounded-2xl animate-slideDown" style={{ animationDelay: '0.1s' }}>
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8 animate-slideDown" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setName('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium smooth-transition ${
                mode === 'login'
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20'
              }`}
            >
              Jump In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium smooth-transition ${
                mode === 'signup'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-slideDown" style={{ animationDelay: '0.3s' }}>
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="animate-slideDown" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-sm focus:bg-white/70 dark:focus:bg-white/20 focus:border-purple-400 dark:focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="animate-slideDown" style={{ animationDelay: mode === 'signup' ? '0.4s' : '0.35s' }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-sm focus:bg-white/70 dark:focus:bg-white/20 focus:border-purple-400 dark:focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="animate-slideDown" style={{ animationDelay: mode === 'signup' ? '0.5s' : '0.4s' }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
                  className="pl-10 bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-sm focus:bg-white/70 dark:focus:bg-white/20 focus:border-purple-400 dark:focus:border-purple-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg animate-slideDown">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg smooth-transition disabled:opacity-50 disabled:cursor-not-allowed gap-2 animate-slideDown hover:shadow-lg hover:scale-105 active:scale-95"
              style={{ animationDelay: mode === 'signup' ? '0.55s' : '0.45s' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {mode === 'login' ? 'Jumping in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'login' ? 'Jump In' : 'Sign Up'}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 animate-slideDown" style={{ animationDelay: mode === 'signup' ? '0.6s' : '0.5s' }}>
          Made for students who want to succeed together 🎓
        </p>
      </div>
    </div>
  );
}
