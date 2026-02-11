# AI-Powered Study Planner - Complete Guide

## 🎯 Overview

A fully functional web application that helps procrastinating students create personalized, AI-powered study plans. The app breaks down entire syllabi into manageable 20-45 minute micro-tasks distributed across days until the exam deadline.

## ✨ Features Implemented

### 1. **Smart Study Planning**

- Input form to add subjects, topics, deadline, and available study hours
- AI-powered algorithm distributes topics evenly across days
- Generates optimized micro-tasks with realistic durations
- Task types: Reading, Video Learning, Practice Problems, Revision

### 2. **Day-Wise Dashboard**

- Interactive planner showing tasks for each day
- Visual progress tracking with completion percentages
- Click to mark tasks as complete
- Auto-calculates daily and overall progress

### 3. **Stress Management**

- Three stress levels: Low, Medium, High
- High stress mode reduces daily workload intelligently
- Remaining tasks are distributed across future days
- No tasks are deleted, just rescheduled

### 4. **Dark Mode**

- Toggle button in bottom-right corner
- Respects system theme preference
- Saves preference to localStorage
- Eye-friendly color scheme

### 5. **Browser Notifications**

- Optional push notifications for study reminders
- Alerts when all tasks for the day are completed
- Motivational messages to encourage consistency

### 6. **Local Data Persistence**

- All plans stored in browser's localStorage
- No server needed - works completely offline
- Progress automatically saved on each task completion
- Easy reset and plan creation

### 7. **Mobile Responsive**

- Fully responsive design for all screen sizes
- Optimized layouts for mobile, tablet, and desktop
- Touch-friendly interfaces
- Fast load times

### 8. **Modern, Beautiful UI**

- Gradient backgrounds with smooth animations
- Purple and blue color scheme promoting focus
- Clean, distraction-free interface
- Professional typography and spacing

## 📁 Project Structure

```
client/
├── pages/
│   ├── Index.tsx          # Landing page with features
│   ├── InputForm.tsx      # Study input form page
│   ├── Dashboard.tsx      # Main planner dashboard
│   └── NotFound.tsx       # 404 page
├── components/
│   └── ui/               # Pre-built UI components
├── hooks/
│   ├── use-mobile.tsx
│   └── use-notifications.ts  # Notification hook
├── lib/
│   ├── utils.ts          # Utility functions
│   └── study-planner.ts  # Core planning logic
├── App.tsx               # Main app with routing & dark mode
└── global.css            # Theme variables & global styles

shared/
└── api.ts                # Shared types & interfaces
```

## 🚀 Getting Started

### Start Development Server

```bash
pnpm dev
```

The app will be available at the local dev server URL.

### Create a Study Plan

1. **Homepage**: Click "Create My Plan Now" button
2. **Input Form**:
   - Enter plan title (e.g., "Finals Preparation")
   - Set deadline using date picker
   - Enter daily study hours available (e.g., 4 hours)
   - Add subjects and topics you need to study
   - Click "Generate My Study Plan"

3. **Dashboard**:
   - View all study days in the left sidebar
   - Click on any day to see tasks for that day
   - Click on tasks to mark them complete
   - Adjust stress level if overwhelmed
   - Enable notifications for study reminders

### Key Interactions

- **Mark Task Complete**: Click the circle icon or anywhere on the task
- **Adjust Stress**: Use the stress level buttons to reschedule tasks
- **View Progress**: Check completion percentage for daily and overall progress
- **Dark Mode**: Click the sun/moon icon in bottom-right
- **Notifications**: Click "Enable Notifications" to opt-in for reminders
- **Reset Plan**: Click "Reset" to clear all progress
- **New Plan**: Click "New Plan" to create a different study plan

## 🔧 Core Logic - Study Plan Generation

### Algorithm Overview

1. **Calculate available days**: (deadline - today)
2. **Distribute topics**: Topics are distributed evenly across available days
3. **Create micro-tasks**: Each topic gets 1-4 tasks of different types:
   - Reading/Studying (20 mins)
   - Video Learning (15-30 mins)
   - Practice Problems (15-35 mins)
   - Revision (10-20 mins)

4. **Validate daily workload**: Ensures tasks don't exceed available hours
5. **Reschedule on stress**: When stress is high, workload is reduced and redistributed

### Task Duration Strategy

- Reading: 20-30 minutes
- Videos: 15-30 minutes
- Practice: 15-35 minutes
- Revision: 10-20 minutes

Total daily time never exceeds user's specified hours.

## 💾 Data Storage

All data is stored in browser's localStorage:

- `studyInput`: Original study input (subjects, topics, deadline)
- `studyPlan`: Generated study plan with progress
- `stressLevel`: Current stress level setting
- `darkMode`: Dark mode preference

**Note**: Data persists even after closing the browser, but is specific to this device/browser.

## 🎨 Customization

### Colors

Edit `client/global.css` to change theme colors. Current scheme:

- Primary: Purple (#7C3AED)
- Secondary: Blue (#3B82F6)
- Accent: Yellow (#FBBF24)

### Task Templates

Edit `client/lib/study-planner.ts` TASK_TEMPLATES object to customize task phrasing.

### Study Hours Defaults

Edit the initial state in `InputForm.tsx` to change default hours.

## 🔐 Security & Privacy

- ✅ No external API calls (except optional OpenAI integration)
- ✅ No tracking or analytics
- ✅ No user accounts needed
- ✅ Data never leaves your device
- ✅ No advertisements
- ✅ Completely free

## 📱 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with responsive design

## 🎯 Optional Enhancements (Not Implemented)

These features could be added in future versions:

1. **OpenAI Integration**: Rewrite tasks in motivating tone
2. **Export to PDF**: Download study plan as PDF
3. **Share Plans**: Generate shareable links
4. **Study Session Timer**: Pomodoro timer for each task
5. **Performance Analytics**: Detailed study statistics
6. **Cloud Sync**: Backup to cloud storage
7. **Collaborative Planning**: Share plans with friends

## 🐛 Troubleshooting

### Plan not saving?

- Check browser's localStorage is enabled
- Clear browser cache and try again
- Try in private/incognito mode

### Notifications not working?

- Grant notification permission when prompted
- Check browser notification settings
- Some browsers block notifications in private mode

### Dark mode not persisting?

- Clear localStorage and toggle dark mode again
- Check browser's dark mode setting

### Tasks not appearing?

- Make sure you added topics to subjects
- Check that deadline is in the future
- Ensure study hours are greater than 0

## 📞 Support

For issues or suggestions, check your browser console for errors. The app is built with modern web standards and should work on any modern browser.

---

**Built for students who want to ace their exams without the stress.** 🚀
