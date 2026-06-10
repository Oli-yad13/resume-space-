import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-semibold text-zinc-900">{label}</label>}
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm transition-all",
          "placeholder:text-zinc-400",
          "hover:border-zinc-400",
          "focus:border-brand focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
