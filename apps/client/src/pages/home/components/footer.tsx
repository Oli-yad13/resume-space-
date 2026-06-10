import { t } from "@lingui/macro";
import { Separator } from "@resume-space/ui";

import { Logo } from "@/client/components/logo";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />

    <div className="container grid py-12 sm:grid-cols-3 lg:grid-cols-4">
      <div className="flex flex-col items-start gap-y-3">
        <Logo size={36} />

        <p className="prose prose-sm prose-zinc leading-relaxed opacity-60 dark:prose-invert">
          {t`Resume Space is a platform that helps you build your future.`}
        </p>
      </div>
    </div>
  </footer>
);
