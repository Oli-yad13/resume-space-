"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { LayoutDashboard, Users, FileText, BarChart3, BookOpen, Briefcase, LogOut } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setShowLogoutModal(false);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white to-zinc-200">
            <span className="text-sm font-bold text-zinc-900">RS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Resume Space</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-6">
        {navigation.map((item) => {
          // Fix: Exact match for dashboard, otherwise check if path starts with the href
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-900" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-zinc-800 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-zinc-800 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white to-zinc-200 ring-2 ring-zinc-700">
            <span className="text-xs font-semibold text-zinc-900">AD</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">Admin</p>
            <p className="truncate text-xs text-zinc-400">Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-red-700 hover:bg-red-700 hover:shadow-lg"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <ModalTitle>Confirm Logout</ModalTitle>
              <ModalDescription>Are you sure you want to logout?</ModalDescription>
            </div>
          </div>
        </ModalHeader>
        <ModalContent>
          <p className="text-sm text-zinc-600">
            You will be redirected to the login page and will need to sign in again to access the
            admin dashboard.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="error" onClick={handleLogout}>
            Logout
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
