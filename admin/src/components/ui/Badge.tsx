import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-700/10",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    error: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    info: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
