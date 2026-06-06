import { cn } from "@resume-space/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Icon = ({ size = 32, className }: Props) => {
  return (
    <img
      src="/icon/icon.png"
      width={size}
      height={size}
      alt="Resume Space"
      className={cn("rounded-sm", className)}
    />
  );
};
