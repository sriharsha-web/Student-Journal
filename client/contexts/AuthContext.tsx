import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ExamReminder {
  date: string;
  subject: string;
  notes?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, password?: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('studytogether_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('studytogether_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call with validation
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get all users from localStorage
    const usersJson = localStorage.getItem('studytogether_users');
    let users: Array<{ email: string; password: string; id: string; name: string; createdAt: string }> = [];

    try {
      if (usersJson) {
        users = JSON.parse(usersJson);
      }
    } catch (error) {
      console.error('Error parsing users:', error);
      throw new Error('Invalid user data. Please try again.');
    }

    // Find user with matching email and password (case-insensitive email)
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const loggedInUser: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt,
    };

    setUser(loggedInUser);
    localStorage.setItem('studytogether_user', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API call with validation
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    const usersJson = localStorage.getItem('studytogether_users');
    let users = [];

    try {
      users = usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      users = [];
    }

    // Check if email already exists (case-insensitive)
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password, // In production, this should be hashed
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('studytogether_users', JSON.stringify(users));

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };

    setUser(user);
    localStorage.setItem('studytogether_user', JSON.stringify(user));

    // Initialize user data
    localStorage.setItem(`studytogether_tasks_${user.id}`, JSON.stringify([]));
    localStorage.setItem(`studytogether_assignments_${user.id}`, JSON.stringify([]));
    localStorage.setItem(`studytogether_revisions_${user.id}`, JSON.stringify([]));
    localStorage.setItem(`studytogether_exam_reminder_${user.id}`, JSON.stringify(null));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studytogether_user');
  };

  const updateProfile = async (name: string, password?: string) => {
    if (!user) throw new Error('No user logged in');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const usersJson = localStorage.getItem('studytogether_users');
    let users = [];

    try {
      users = usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      throw new Error('Failed to update profile');
    }

    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].name = name;
    if (password) {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      users[userIndex].password = password;
    }

    localStorage.setItem('studytogether_users', JSON.stringify(users));

    const updatedUser = { ...user, name };
    setUser(updatedUser);
    localStorage.setItem('studytogether_user', JSON.stringify(updatedUser));
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Delete from users list
    const usersJson = localStorage.getItem('studytogether_users');
    let users = usersJson ? JSON.parse(usersJson) : [];
    users = users.filter((u: any) => u.id !== user.id);
    localStorage.setItem('studytogether_users', JSON.stringify(users));

    // Delete all user data
    localStorage.removeItem(`studytogether_tasks_${user.id}`);
    localStorage.removeItem(`studytogether_assignments_${user.id}`);
    localStorage.removeItem(`studytogether_revisions_${user.id}`);
    localStorage.removeItem(`studytogether_exam_reminder_${user.id}`);
    localStorage.removeItem(`studytogether_subjects_${user.id}`);

    // Logout
    setUser(null);
    localStorage.removeItem('studytogether_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
