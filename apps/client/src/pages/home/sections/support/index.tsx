import { t } from "@lingui/macro";

export const SupportSection = () => (
  <section
    id="support"
    className="relative space-y-12 bg-secondary-accent py-24 text-primary sm:py-32"
  >
    <div className="container space-y-6">
      <h1 className="text-4xl font-bold">{t`Supporting Resume Space`}</h1>

      <p className="max-w-4xl leading-loose">
        {t`Resume Space is a free and open-source project. The best ways to support it right now are to star the repository, report issues, share it with others, and help improve the product over time.`}
      </p>

      <div className="flex items-center gap-x-10">
        <a
          href="https://github.com/Oli-yad13/resume-space-"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          <img
            src="/support-logos/github-sponsors-light.svg"
            className="hidden max-h-[42px] dark:block"
            // eslint-disable-next-line lingui/no-unlocalized-strings
            alt="GitHub Sponsors"
          />
          <img
            src="/support-logos/github-sponsors-dark.svg"
            className="block max-h-[42px] dark:hidden"
            // eslint-disable-next-line lingui/no-unlocalized-strings
            alt="GitHub Sponsors"
          />
        </a>
        <a
          href="https://github.com/Oli-yad13/resume-space-/issues"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          <img
            src="/support-logos/open-collective-light.svg"
            className="hidden max-h-[38px] dark:block"
            // eslint-disable-next-line lingui/no-unlocalized-strings
            alt="Open Collective"
          />
          <img
            src="/support-logos/open-collective-dark.svg"
            className="block max-h-[38px] dark:hidden"
            // eslint-disable-next-line lingui/no-unlocalized-strings
            alt="Open Collective"
          />
        </a>
        <a
          href="https://github.com/Oli-yad13/resume-space-/blob/main/RUNNING.md"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <img src="/support-logos/paypal.svg" className="max-h-[28px]" alt="PayPal" />
        </a>
      </div>

      <p className="max-w-4xl leading-loose">
        {t`If you're multilingual, we'd love help bringing the app to more languages and communities. If your language is missing, open an issue on GitHub and we can track translation work there.`}
      </p>

      <div className="flex items-center gap-x-10">
        <img
          src="/support-logos/crowdin-light.svg"
          className="hidden max-h-[32px] dark:block"
          // eslint-disable-next-line lingui/no-unlocalized-strings
          alt="Crowdin"
        />
        <img
          src="/support-logos/crowdin-dark.svg"
          className="block max-h-[32px] dark:hidden"
          // eslint-disable-next-line lingui/no-unlocalized-strings
          alt="Crowdin"
        />
      </div>

      <p className="max-w-4xl leading-loose">
        {t`You can still make a real difference by starring the repository, opening thoughtful issues, testing changes, and spreading the word to people who need a better resume workflow.`}
      </p>
    </div>
  </section>
);
