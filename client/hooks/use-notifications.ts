import { useEffect } from "react";

export function useNotifications() {
  useEffect(() => {
    // Request notification permission if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      // Don't auto-request, let user opt-in via the notification button
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    }

    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          icon: "/placeholder.svg",
          badge: "/placeholder.svg",
          ...options,
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  const scheduleDailyReminder = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    // Check every minute if it's time to send a reminder
    const checkReminder = () => {
      const now = new Date();
      const hour = now.getHours();

      // Send reminder at 8 AM
      if (hour === 8 && now.getMinutes() === 0) {
        sendNotification("Time to Study! ☀️", {
          body: "Your daily study session is waiting for you. You got this!",
          tag: "daily-reminder",
        });
      }
    };

    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  };

  const sendTaskReminder = (taskCount: number) => {
    sendNotification("Daily Study Progress 📚", {
      body: `You have ${taskCount} task${taskCount !== 1 ? "s" : ""} remaining today. Keep going!`,
      tag: "task-reminder",
    });
  };

  const sendCompletionNotification = () => {
    sendNotification("Great Job! 🎉", {
      body: "You completed all tasks for today. Rest well and see you tomorrow!",
      tag: "completion-notification",
    });
  };

  return {
    requestPermission,
    sendNotification,
    scheduleDailyReminder,
    sendTaskReminder,
    sendCompletionNotification,
  };
}
