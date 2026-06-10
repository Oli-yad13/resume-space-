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
  // Flat, minimal (odit.et style): no shadows, tight radii.
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark focus:ring-brand",
    secondary: "bg-brand-soft text-brand hover:bg-brand-soft/70 focus:ring-brand",
    error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    ghost: "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 focus:ring-zinc-500",
    outline:
      "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
