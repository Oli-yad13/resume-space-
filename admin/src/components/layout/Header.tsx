"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

const TITLES: [string, string, string][] = [
  // [prefix, title, description]
  ["/dashboard/users", "Users", "All registered accounts on the platform"],
  ["/dashboard/resumes", "Resumes", "Resumes created by users"],
  ["/dashboard/resources", "Resources", "Learning videos and articles"],
  ["/dashboard/jobs", "Jobs", "Job postings on the marketplace"],
  ["/dashboard/approvals", "Approvals", "Review pending organization posts"],
  ["/dashboard/org-accounts", "Organization Accounts", "Partner accounts that can post to the platform"],
  ["/dashboard/statistics", "Statistics", "Analytics and insights"],
];

export function Header() {
  const pathname = usePathname();
  const { user, isSuper } = useAuth();

  const match = TITLES.find(([prefix]) => pathname.startsWith(prefix));
  const title = match?.[1] ?? "Dashboard";
  const description = match?.[2] ?? `Signed in as ${user.name}`;

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
      <div className="flex h-14 items-center justify-between px-8">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">{title}</h1>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>

        <span
          className={
            isSuper
              ? "rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-brand"
              : "rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-accent-pink"
          }
        >
          {isSuper ? "Super Admin" : (user.organization ?? "Organization")}
        </span>
      </div>
    </header>
  );
}
