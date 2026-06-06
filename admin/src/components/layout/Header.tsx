"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const getPageTitle = (pathname: string) => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/dashboard/users") return "Users";
  if (pathname === "/dashboard/resumes") return "Resumes";
  if (pathname === "/dashboard/statistics") return "Statistics";
  return "Dashboard";
};

const getPageDescription = (pathname: string) => {
  if (pathname === "/dashboard") return "Welcome to Resume Space Admin Dashboard";
  if (pathname === "/dashboard/users") return "Manage all registered users";
  if (pathname === "/dashboard/resumes") return "Manage all user resumes";
  if (pathname === "/dashboard/statistics") return "Detailed analytics and insights";
  return "";
};

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const description = getPageDescription(pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const notifications = [
    {
      id: 1,
      title: "New user registered",
      message: "John Doe just created an account",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "Resume published",
      message: "Sarah Smith published a new resume",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "System update",
      message: "Database backup completed successfully",
      time: "3 hours ago",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
          {description && <p className="text-sm text-zinc-500">{description}</p>}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="animate-slide-in absolute right-0 top-12 w-80 rounded-xl border border-zinc-200 bg-white shadow-2xl">
                {/* Header */}
                <div className="border-b border-zinc-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">Notifications</h3>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      {notifications.filter((n) => n.unread).length} new
                    </span>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50 ${
                        notification.unread ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            notification.unread ? "bg-blue-500" : "bg-zinc-300"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">{notification.title}</p>
                          <p className="mt-0.5 text-sm text-zinc-600">{notification.message}</p>
                          <p className="mt-1 text-xs text-zinc-500">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-100 px-4 py-3">
                  <button className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
