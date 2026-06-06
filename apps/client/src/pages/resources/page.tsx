import { t } from "@lingui/macro";
import { BookOpen, MagnifyingGlass, Video, FileText, X } from "@phosphor-icons/react";
import { Badge } from "@resume-space/ui";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

import { useResources, useResourceCategories } from "@/client/services/resource";

export const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VIDEO" | "ARTICLE">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { categories } = useResourceCategories();
  const { resources, loading } = useResources({
    type: typeFilter === "ALL" ? undefined : typeFilter,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery || undefined,
  });

  const featuredResources = resources.filter((r) => r.featured).slice(0, 3);

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

  return (
    <>
      <Helmet>
        <title>
          {t`Resources`} - {t`Resume Space`}
        </title>
      </Helmet>

      {/* Hero Section */}
      <div className="border-b bg-gradient-to-br from-primary/5 to-primary/10 pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{t`Career Resources`}</h1>
            <p className="mx-auto max-w-2xl text-lg opacity-75">
              {t`Expert guides, videos, and tips to help you succeed in your job search and career development`}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t`Featured Resources`}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource) => {
                const videoId = resource.type === "VIDEO" ? extractVideoId(resource.videoUrl || "") : null;

                return (
                  <Link
                    key={resource.id}
                    to={`/resources/${resource.id}`}
                    className="group relative overflow-hidden rounded-xl border bg-secondary shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      {resource.type === "VIDEO" && videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={resource.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={48} className="opacity-20" />
                        </div>
                      )}
                      {resource.type === "VIDEO" && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 backdrop-blur-sm">
                          <Video size={14} weight="fill" className="text-white" />
                          <span className="text-xs font-medium text-white">Video</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3 p-5">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed opacity-75">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {resource.category}
                        </Badge>
                        <span className="text-xs font-medium opacity-60">{resource.views} views</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              type="text"
              placeholder={t`Search resources...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-xl border-2 bg-secondary pl-12 pr-12 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-50 transition-all hover:bg-secondary-accent hover:opacity-100"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                typeFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary hover:bg-secondary-accent"
              }`}
            >
              {t`All Types`}
            </button>
            <button
              onClick={() => setTypeFilter("VIDEO")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                typeFilter === "VIDEO"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary hover:bg-secondary-accent"
              }`}
            >
              <Video size={16} weight="bold" />
              {t`Videos`}
            </button>
            <button
              onClick={() => setTypeFilter("ARTICLE")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                typeFilter === "ARTICLE"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary hover:bg-secondary-accent"
              }`}
            >
              <FileText size={16} weight="bold" />
              {t`Articles`}
            </button>
          </div>
        </div>

        {/* Sidebar with Categories & Resources Grid */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Categories Sidebar */}
          <div className="space-y-4">
            <h3 className="px-4 text-base font-bold">{t`Categories`}</h3>
            <div className="space-y-2 rounded-xl border bg-secondary p-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-secondary-accent"
                }`}
              >
                {t`All Resources`}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-secondary-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat.category}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      selectedCategory === cat.category 
                        ? "bg-primary-foreground/20" 
                        : "bg-secondary-accent"
                    }`}>
                      {cat.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div>
            {loading ? (
              <div className="flex h-96 items-center justify-center rounded-xl border bg-secondary/50">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium opacity-75">{t`Loading resources...`}</p>
                </div>
              </div>
            ) : resources.length === 0 ? (
              <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/30">
                <BookOpen size={64} className="opacity-20" />
                <p className="mt-6 text-lg font-semibold">{t`No resources found`}</p>
                <p className="mt-2 text-sm opacity-75">{t`Try adjusting your filters or search query`}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => {
                  const videoId = resource.type === "VIDEO" ? extractVideoId(resource.videoUrl || "") : null;

                  return (
                    <Link
                      key={resource.id}
                      to={`/resources/${resource.id}`}
                      className="group overflow-hidden rounded-xl border bg-secondary shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                        {resource.type === "VIDEO" && videoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={resource.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText size={56} className="opacity-20" />
                          </div>
                        )}
                        {resource.type === "VIDEO" && (
                          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 backdrop-blur-sm">
                            <Video size={14} weight="fill" className="text-white" />
                            <span className="text-xs font-medium text-white">Video</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {/* Content */}
                      <div className="space-y-3 p-5">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed opacity-75">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="secondary" className="text-xs font-medium">
                            {resource.category}
                          </Badge>
                          <span className="text-xs font-medium opacity-60">{resource.views} views</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

