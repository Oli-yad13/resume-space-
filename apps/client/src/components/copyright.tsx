import { t, Trans } from "@lingui/macro";
import { cn } from "@resume-space/utils";

type Props = {
  className?: string;
};

export const Copyright = ({ className }: Props) => (
  <div
    className={cn(
      "prose prose-sm prose-zinc flex max-w-none flex-col gap-y-1 text-xs opacity-40 dark:prose-invert",
      className,
    )}
  >
    <span>
      <Trans>Licensed under MIT</Trans>
    </span>
    <span>{t`By the community, for the community.`}</span>
    <span>
      
    </span>

    <span className="mt-4">
      {t`Resume Space`} {"v" + appVersion}
    </span>
  </div>
);
