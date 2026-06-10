import { cn } from "@resume-space/utils";

type Props = {
  /** Rendered height in px; width scales automatically to keep the lockup's aspect ratio. */
  size?: number;
  className?: string;
};

// The wordmark ships in two variants: purple text for light backgrounds and
// white text for dark backgrounds (the gradient mark works on both). The
// theme is a `dark` class on <html>, so CSS handles the swap.
export const Logo = ({ size = 32, className }: Props) => {
  return (
    <>
      <img
        src="/logo/logo.png"
        alt="Resume Space"
        style={{ height: size, width: "auto" }}
        className={cn("dark:hidden", className)}
      />
      <img
        src="/logo/logo-dark.png"
        alt="Resume Space"
        style={{ height: size, width: "auto" }}
        className={cn("hidden dark:block", className)}
      />
    </>
  );
};
