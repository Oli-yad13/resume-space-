import { t } from "@lingui/macro";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  DownloadSimple,
  FileText,
  Sparkle,
} from "@phosphor-icons/react";
import { Button } from "@resume-space/ui";
import { motion } from "framer-motion";
import { Link } from "react-router";

const steps = [
  {
    icon: FileText,
    title: t`Start with a resume`,
    description: t`Create one from scratch or import an existing file, LinkedIn export, or JSON resume.`,
    cta: t`Open resume workspace`,
    href: "/dashboard/resumes",
  },
  {
    icon: Sparkle,
    title: t`Improve it quickly`,
    description: t`Refine writing, adjust sections, pick a template, and prepare a version you can actually send.`,
    cta: t`Explore templates`,
    href: "#sample-resumes",
  },
  {
    icon: Briefcase,
    title: t`Apply and track`,
    description: t`Use your resume to explore jobs, submit applications, and keep your pipeline visible in one place.`,
    cta: t`Browse jobs`,
    href: "/jobs",
  },
];

export const WorkflowSection = () => (
  <section id="workflow" className="relative py-24 sm:py-32">
    <div className="container space-y-10">
      <div className="max-w-3xl space-y-4">
        <h2 className="text-4xl font-bold">{t`A clearer job search workflow`}</h2>
        <p className="text-base leading-8 text-muted-foreground">
          {t`Resume Space works best when it helps you move from drafting to applying without switching tools or losing context.`}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0, transition: { delay: index * 0.08 } }}
              viewport={{ once: true, amount: 0.2 }}
              className="flex h-full flex-col rounded-lg border bg-card/70 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Icon size={22} weight="duotone" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="leading-7 text-muted-foreground">{step.description}</p>
              </div>

              <div className="mt-6">
                <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
                  {step.href.startsWith("#") ? (
                    <a href={step.href}>
                      {step.cta}
                      <ArrowRight className="ml-2" size={16} />
                    </a>
                  ) : (
                    <Link to={step.href}>
                      {step.cta}
                      <ArrowRight className="ml-2" size={16} />
                    </Link>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 rounded-lg border bg-secondary/30 p-6 lg:grid-cols-3">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} weight="duotone" className="mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold">{t`Resume workspace`}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t`Keep source resumes, tailored versions, and exported output in one place.`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkle size={20} weight="duotone" className="mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold">{t`AI assistance where it matters`}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t`Use AI for parsing and writing help instead of making it the whole product.`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DownloadSimple size={20} weight="duotone" className="mt-0.5 text-primary" />
          <div>
            <h3 className="font-semibold">{t`Application-ready output`}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t`Export polished resumes, then move straight into jobs and application tracking.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
