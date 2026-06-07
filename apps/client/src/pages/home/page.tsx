import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Helmet } from "react-helmet-async";

import { FAQSection } from "./sections/faq";
import { HeroSection } from "./sections/hero";
import { TemplatesSection } from "./sections/templates";
import { WorkflowSection } from "./sections/workflow";

export const HomePage = () => {
  const { i18n } = useLingui();

  return (
    <main className="relative isolate bg-background">
      <Helmet prioritizeSeoTags>
        <html lang={i18n.locale} />

        <title>
          {t`Resume Space`} - {t`Build Your Future`}
        </title>

        <meta
          name="description"
          content="Resume Space is a platform that helps you build your future."
        />
      </Helmet>

      <HeroSection />
      <WorkflowSection />
      {/* <LogoCloudSection /> */}
      {/* <StatisticsSection /> */}
      {/* <FeaturesSection /> */}
      <TemplatesSection />
      {/* <TestimonialsSection /> */}
      {/* <SupportSection /> */}
      <FAQSection />
      {/* <ContributorsSection /> */}
    </main>
  );
};
