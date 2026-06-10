"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckSquare,
  LogOut,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// Org admins manage their own posts; everything else is super-admin only.
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, superOnly: false },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase, superOnly: false },
  { name: "Resources", href: "/dashboard/resources", icon: BookOpen, superOnly: false },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare, superOnly: true },
  { name: "Org Accounts", href: "/dashboard/org-accounts", icon: Building2, superOnly: true },
  { name: "Users", href: "/dashboard/users", icon: Users, superOnly: true },
  { name: "Resumes", href: "/dashboard/resumes", icon: FileText, superOnly: true },
  { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3, superOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isSuper, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const items = navigation.filter((item) => isSuper || !item.superOnly);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full w-60 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-5">
        <Link href="/dashboard" className="flex flex-col gap-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Resume Space" className="h-7 w-auto self-start" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {isSuper ? "Super Admin" : "Partner Portal"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-soft text-brand"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-200 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="brand-hairline flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <span className="text-[11px] font-semibold text-white">{initials}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">
              {isSuper ? "Super Admin" : (user.organization ?? "Organization")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>

      {/* Logout Confirmation */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <ModalHeader>
          <ModalTitle>Sign out</ModalTitle>
          <ModalDescription>You will need to sign in again to manage your posts.</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <p className="text-sm text-zinc-600">Are you sure you want to sign out?</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="error" onClick={() => void logout()}>
            Sign out
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
