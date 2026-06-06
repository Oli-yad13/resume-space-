import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <thead className={cn("border-b border-zinc-200 bg-zinc-50", className)}>{children}</thead>;
}

export function TableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={cn("divide-y divide-zinc-200", className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("border-b border-zinc-200 transition-colors hover:bg-zinc-50/50", className)}>
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-zinc-700",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("p-4 align-middle text-zinc-900", className)}>{children}</td>;
}
