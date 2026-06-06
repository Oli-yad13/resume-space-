import { t } from "@lingui/macro";
import { Briefcase, List as ListIcon, Sparkle, SquaresFour } from "@phosphor-icons/react";
import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "@resume-space/ui";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { useLocalStorage } from "usehooks-ts";

import { useJobRecommendations } from "@/client/services/job";

import { GridView } from "./_layouts/grid";
import { ListView } from "./_layouts/list";

type Layout = "grid" | "list";

export const ResumesPage = () => {
  const [layout, setLayout] = useLocalStorage<Layout>("dashboard-layout", "grid", {
    initializeWithValue: true,
  });

  const { recommendations, loading: recommendationsLoading } = useJobRecommendations();
  const showRecommendations = recommendations.length > 0 && !recommendationsLoading;

  return (
    <>
      <Helmet>
        <title>
          {t`Resumes`} - {t`Resume Space`}
        </title>
      </Helmet>

      {/* AI-Powered Job Recommendations Widget */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Sparkle size={24} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t`Jobs You Might Like`}</h2>
                <p className="text-sm text-muted-foreground">
                  {t`AI-powered recommendations based on your resume`}
                </p>
              </div>
            </div>
            <Link
              to="/jobs"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Briefcase size={18} />
              {t`View All Jobs`}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group rounded-lg border bg-background/50 p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                    {job.title}
                  </h3>
                  <span className="ml-2 shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                    {job.aiScore}%
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{job.company}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5">{job.locationType}</span>
                  <span className="rounded bg-secondary px-2 py-0.5">{job.employmentType}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs italic text-muted-foreground">
                  <Sparkle size={12} weight="fill" className="mr-1 inline text-primary" />
                  {job.aiReasoning}
                </p>
              </Link>
            ))}
          </div>

          {recommendations.length > 3 && (
            <div className="mt-4 text-center">
              <Link
                to="/jobs"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t`View ${recommendations.length - 3} more recommendations →`}
              </Link>
            </div>
          )}
        </motion.div>
      )}

      <Tabs
        value={layout}
        className="space-y-4"
        onValueChange={(value) => {
          setLayout(value as Layout);
        }}
      >
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            {t`Resumes`}
          </motion.h1>

          <TabsList>
            <TabsTrigger value="grid" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
              <SquaresFour />
              <span className="ml-2 hidden sm:block">{t`Grid`}</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
              <ListIcon />
              <span className="ml-2 hidden sm:block">{t`List`}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea
          allowOverflow
          className="h-[calc(100vh-140px)] overflow-visible lg:h-[calc(100vh-88px)]"
        >
          <TabsContent value="grid">
            <GridView />
          </TabsContent>
          <TabsContent value="list">
            <ListView />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );
};
