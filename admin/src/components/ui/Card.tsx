import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        // Flat, minimal (odit.et style): hairline border, no shadow, no motion.
        "rounded-md border border-zinc-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight text-zinc-900", className)}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("text-sm text-zinc-500", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>;
}
