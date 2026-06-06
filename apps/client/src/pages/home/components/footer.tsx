import { t } from "@lingui/macro";
import { Separator } from "@resume-space/ui";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />

    <div className="container grid py-12 sm:grid-cols-3 lg:grid-cols-4">
      <div className="flex flex-col gap-y-2">
        <h2 className="text-xl font-medium">{t`Resume Space`}</h2>

        <p className="prose prose-sm prose-zinc leading-relaxed opacity-60 dark:prose-invert">
          {t`Resume Space is a platform that helps you build your future.`}
        </p>
      </div>
    </div>
  </footer>
);
