import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "error" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900 shadow-sm hover:shadow",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500 shadow-sm hover:shadow",
    error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm hover:shadow",
    ghost: "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 focus:ring-zinc-500",
    outline:
      "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 focus:ring-zinc-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
