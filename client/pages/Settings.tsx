import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, Lock, CheckCircle, AlertCircle, Calendar, Bell } from 'lucide-react';
import { playAlarmSound } from '@/lib/alarm-utils';

interface ExamReminder {
  date: string;
  subject: string;
  notes?: string;
}

export default function Settings() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examReminder, setExamReminder] = useState<ExamReminder | null>(null);
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamNotes, setNewExamNotes] = useState('');

  // Load exam reminder from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`studytogether_exam_reminder_${user.id}`);
    if (saved) {
      try {
        setExamReminder(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading exam reminder:', error);
      }
    }
  }, [user]);

  // Check for exam reminder notifications
  useEffect(() => {
    if (!examReminder || !user) return;

    const checkExamDate = setInterval(() => {
      const now = new Date();
      const examDate = new Date(examReminder.date);
      const timeUntilExam = examDate.getTime() - now.getTime();

      // Show reminder 24 hours before exam
      if (timeUntilExam > 0 && timeUntilExam < 24 * 60 * 60 * 1000) {
        const hours = Math.ceil(timeUntilExam / (60 * 60 * 1000));
        showNotification(
          `Exam in ${hours} hours!`,
          `${examReminder.subject} exam is coming up on ${examReminder.date}`
        );
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkExamDate);
  }, [examReminder, user]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name);
      setMessage({ type: 'success', text: 'Name updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update name',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
      });
    }
  };

  const handleAddExamReminder = () => {
    if (!newExamDate || !newExamSubject) {
      setMessage({ type: 'error', text: 'Please fill in exam date and subject' });
      return;
    }

    const reminder: ExamReminder = {
      date: newExamDate,
      subject: newExamSubject,
      notes: newExamNotes,
    };

    setExamReminder(reminder);
    if (user) {
      localStorage.setItem(`studytogether_exam_reminder_${user.id}`, JSON.stringify(reminder));
    }

    setMessage({ type: 'success', text: 'Exam reminder set successfully!' });
    setNewExamDate('');
    setNewExamSubject('');
    setNewExamNotes('');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteExamReminder = () => {
    setExamReminder(null);
    if (user) {
      localStorage.removeItem(`studytogether_exam_reminder_${user.id}`);
    }
    setMessage({ type: 'success', text: 'Exam reminder deleted' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await deleteAccount();
      setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete account',
      });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 smooth-transition ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p
              className={
                message.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-lg p-6 rounded-2xl lg:col-span-1">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                <User className="w-10 h-10" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </Card>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Name */}
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email (Cannot be changed)
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10"
                  />
                </div>

                <Button
                  onClick={handleUpdateName}
                  disabled={loading || name === user?.name}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 disabled:opacity-50"
                >
                  Save Changes
                </Button>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !newPassword}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2 disabled:opacity-50"
                >
                  Update Password
                </Button>
              </div>
            </Card>

            {/* Exam Reminder */}
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Exam Reminder
              </h2>

              {examReminder ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg">
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                      {examReminder.subject}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                      Exam Date: <span className="font-semibold">{examReminder.date}</span>
                    </p>
                    {examReminder.notes && (
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Notes: {examReminder.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleDeleteExamReminder}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    Remove Reminder
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value)}
                      placeholder="e.g., Final Exam"
                      className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Exam Date
                    </label>
                    <Input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={newExamNotes}
                      onChange={(e) => setNewExamNotes(e.target.value)}
                      placeholder="Add any notes or details..."
                      className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleAddExamReminder}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Set Exam Reminder
                  </Button>
                </div>
              )}
            </Card>

            {/* Additional Settings */}
            <Card className="glass-lg p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Enable Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get reminders for your study sessions
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Email Digest
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Weekly summary of your progress
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically enabled (toggle in navbar)
                    </p>
                  </div>
                  <div className="text-xs bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-purple-700 dark:text-purple-300">
                    Active
                  </div>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-lg p-6 rounded-2xl border-2 border-red-200 dark:border-red-800/50">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Delete all your data. This action cannot be undone.
              </p>

              {showDeleteConfirm && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                  <p className="font-medium text-red-700 dark:text-red-300 mb-3">
                    Are you absolutely sure? This will permanently delete your account and all associated data.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Yes, Delete Everything
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleDeleteAccount}
                disabled={loading || showDeleteConfirm}
                className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 disabled:opacity-50"
              >
                {showDeleteConfirm ? 'Confirm Deletion' : 'Delete Account & All Data'}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
