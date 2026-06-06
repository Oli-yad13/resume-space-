import { t } from "@lingui/macro";
import { ArrowLeft, BookOpen, Eye, Video, FileText } from "@phosphor-icons/react";
import { Badge } from "@resume-space/ui";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router";

import { RESOURCE_KEY, RESOURCES_KEY } from "@/client/constants/query-keys";
import { findResourceById, fetchResources } from "@/client/services/resource";

export const ResourceViewPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch current resource
  const { data: resource, isLoading } = useQuery({
    queryKey: [...RESOURCE_KEY, id],
    queryFn: () => findResourceById({ id: id! }),
    enabled: !!id,
  });

  // Fetch related resources (same category)
  const { data: relatedResources } = useQuery({
    queryKey: [...RESOURCES_KEY, { category: resource?.category }],
    queryFn: () => fetchResources({ category: resource?.category }),
    enabled: !!resource?.category,
  });

  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-14 w-14 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium opacity-75">{t`Loading resource...`}</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-6">
        <BookOpen size={72} className="opacity-20" />
        <h2 className="text-3xl font-bold">{t`Resource not found`}</h2>
        <p className="text-sm opacity-75">{t`The resource you're looking for doesn't exist`}</p>
        <Link
          to="/resources"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
        >
          <ArrowLeft size={18} />
          {t`Back to Resources`}
        </Link>
      </div>
    );
  }

  const videoId = resource.type === "VIDEO" ? extractVideoId(resource.videoUrl || "") : null;
  const related = relatedResources?.filter((r) => r.id !== resource.id).slice(0, 3) || [];

  return (
    <>
      <Helmet>
        <title>
          {resource.title} - {t`Resources`} - {t`Resume Space`}
        </title>
      </Helmet>

      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 pb-16">
        {/* Back Button */}
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-secondary"
        >
          <ArrowLeft size={16} />
          {t`Back to Resources`}
        </Link>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Resource Header */}
          <div className="space-y-6 rounded-xl border bg-secondary p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" className="flex items-center gap-1.5 px-3 py-1">
                {resource.type === "VIDEO" ? (
                  <>
                    <Video size={16} weight="bold" />
                    {t`Video`}
                  </>
                ) : (
                  <>
                    <FileText size={16} weight="bold" />
                    {t`Article`}
                  </>
                )}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-medium">
                {resource.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm font-medium opacity-60">
                <Eye size={18} />
                <span>{resource.views} views</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight">{resource.title}</h1>
            <p className="text-lg leading-relaxed opacity-80">{resource.description}</p>
          </div>

          {/* Resource Content */}
          <div className="overflow-hidden rounded-xl border bg-secondary shadow-lg">
            {resource.type === "VIDEO" && videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={resource.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : resource.type === "ARTICLE" && resource.content ? (
              <div className="prose prose-zinc max-w-none p-8 dark:prose-invert">
                <div className="whitespace-pre-wrap">{resource.content}</div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="opacity-50">{t`Content not available`}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Resources */}
        {related.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t`Related Resources`}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedResource) => {
                const relatedVideoId =
                  relatedResource.type === "VIDEO"
                    ? extractVideoId(relatedResource.videoUrl || "")
                    : null;

                return (
                  <Link
                    key={relatedResource.id}
                    to={`/resources/${relatedResource.id}`}
                    className="group overflow-hidden rounded-xl border bg-secondary shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      {relatedResource.type === "VIDEO" && relatedVideoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${relatedVideoId}/maxresdefault.jpg`}
                          alt={relatedResource.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={48} className="opacity-20" />
                        </div>
                      )}
                      {relatedResource.type === "VIDEO" && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 backdrop-blur-sm">
                          <Video size={12} weight="fill" className="text-white" />
                          <span className="text-xs font-medium text-white">Video</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3 p-5">
                      <h3 className="line-clamp-2 font-semibold leading-tight group-hover:text-primary transition-colors">
                        {relatedResource.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed opacity-75">
                        {relatedResource.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {relatedResource.category}
                        </Badge>
                        <span className="text-xs font-medium opacity-60">{relatedResource.views} views</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
