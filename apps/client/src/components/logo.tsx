import { cn } from "@resume-space/utils";

type Props = {
  /** Rendered height in px; width scales automatically to keep the lockup's aspect ratio. */
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className }: Props) => {
  return (
    <img
      src="/logo/logo.png"
      alt="Resume Space"
      style={{ height: size, width: "auto" }}
      className={cn(className)}
    />
  );
};
