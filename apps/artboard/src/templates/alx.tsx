import { cn, isUrl, sanitize } from "@resume-space/utils";
import React from "react";

import { BrandIcon } from "../components/brand-icon";
import { useSectionSlice } from "../lib/pagination";
import { useArtboardStore } from "../store/artboard";
import type { TemplateProps } from "../types/template";

// FlowCV-modeled palette: body ink is full foreground; only dates/locations
// and issuer parentheticals step down slightly.
const META = "text-gray-700";
const FAINT = "text-gray-600";

const ContactItem = ({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) => (
  <span className="flex items-center gap-x-1.5">
    <span className="text-foreground">{icon}</span>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer noopener nofollow">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    )}
  </span>
);

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);
  const profiles = useArtboardStore((state) => state.resume.sections.profiles);

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-[2.15rem] font-bold leading-none text-foreground">
          {basics?.name || ""}
        </h1>
        {basics?.headline && (
          <div className="mt-1.5 text-[1.15rem] leading-tight text-foreground">
            {basics.headline}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.92rem]">
          {basics?.email && (
            <ContactItem
              icon={<i className="ph ph-bold ph-envelope" />}
              href={`mailto:${basics.email}`}
            >
              {basics.email}
            </ContactItem>
          )}
          {basics?.phone && (
            <ContactItem icon={<i className="ph ph-bold ph-phone" />} href={`tel:${basics.phone}`}>
              {basics.phone}
            </ContactItem>
          )}
          {basics?.location && (
            <ContactItem icon={<i className="ph ph-bold ph-map-pin" />}>
              {basics.location}
            </ContactItem>
          )}
          {basics?.url && isUrl(basics.url.href) && (
            <ContactItem icon={<i className="ph ph-bold ph-link" />} href={basics.url.href}>
              {basics.url.label || basics.url.href}
            </ContactItem>
          )}
        </div>

        {profiles?.visible && (profiles?.items?.length ?? 0) > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.92rem]">
            {profiles.items
              .filter((profile) => profile.visible)
              .map(
                (profile) =>
                  profile?.url &&
                  isUrl(profile.url.href) && (
                    <ContactItem
                      key={profile.id}
                      icon={<BrandIcon slug={profile.icon} />}
                      href={profile.url.href}
                    >
                      {profile.username || profile.url.label || profile.url.href}
                    </ContactItem>
                  ),
              )}
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({
  id,
  title,
  showHeader = true,
  children,
}: {
  id: string;
  title: string;
  showHeader?: boolean;
  children: React.ReactNode;
}) => (
  <section data-pagination-section={id} data-pagination-gap={10} className="space-y-2">
    {showHeader && (
      <div data-pagination-header>
        <h2 className="text-base font-bold uppercase tracking-[0.05em] text-foreground">
          {title}
        </h2>
        <div className="mt-[3px] h-[2.5px] w-full bg-foreground" />
      </div>
    )}
    <div className="space-y-2.5">{children}</div>
  </section>
);

// FlowCV entry head: bold primary + ", " + italic secondary on the left,
// date and location stacked right-aligned in slightly softened ink.
const EntryHead = ({
  primary,
  secondary,
  date,
  location,
}: {
  primary?: string;
  secondary?: string;
  date?: string;
  location?: string;
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <div className="text-base leading-snug">
      {primary && <span className="font-bold text-foreground">{primary}</span>}
      {primary && secondary && ", "}
      {secondary && <span className="italic">{secondary}</span>}
    </div>
    {(date || location) && (
      <div className={cn("shrink-0 text-right text-[0.92rem] leading-snug", META)}>
        {date && <div>{date}</div>}
        {location && <div>{location}</div>}
      </div>
    )}
  </div>
);

const RichText = ({ content }: { content?: string }) =>
  content ? (
    <div
      className="wysiwyg text-base leading-[1.32] [&_li]:mb-[3px] [&_li]:leading-[1.32] [&_p]:mb-1 [&_ul]:mb-0 [&_ul]:pl-[1.1em]"
      dangerouslySetInnerHTML={{ __html: sanitize(content) }}
    />
  ) : null;

const useSectionItems = <T,>(sectionId: string, items: T[]) => {
  const slice = useSectionSlice(sectionId);
  const itemsToRender = slice ? items.slice(slice.start, slice.end) : items;
  return { slice, itemsToRender, showHeader: !slice || slice.showHeader };
};

const SummarySection = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);
  const slice = useSectionSlice(section.id);

  if (!section?.visible || !section?.content) return null;
  if (slice && slice.end - slice.start === 0) return null;

  return (
    <Section
      id={section.id}
      title={section.name || "Summary"}
      showHeader={!slice || slice.showHeader}
    >
      <div data-pagination-item={section.id}>
        <RichText content={section.content} />
      </div>
    </Section>
  );
};

const ExperienceSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Experience"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead
            primary={item?.position}
            secondary={item?.company}
            date={item?.date}
            location={item?.location}
          />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const EducationSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Education"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead
            primary={[item?.studyType, item?.area].filter(Boolean).join(" ").trim() || item?.area}
            secondary={item?.institution}
            date={item?.date}
          />
          {item?.score && <div className={cn("text-[0.92rem]", META)}>{item.score}</div>}
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const ProjectsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Projects"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead primary={item?.name} secondary={item?.description} date={item?.date} />
          {item?.url && isUrl(item.url.href) && (
            <a
              href={item.url.href}
              target="_blank"
              rel="noreferrer"
              className={cn("text-[0.92rem]", META)}
            >
              {item.url.label || item.url.href}
            </a>
          )}
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const SkillsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Skills"} showHeader={showHeader}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-2.5">
        {itemsToRender.map((skill) => {
          const detail =
            skill?.keywords && skill.keywords.length > 0
              ? skill.keywords.join(", ")
              : skill?.description;
          return (
            <div key={skill?.id} data-pagination-item={skill?.id}>
              <div className="text-base font-bold leading-snug text-foreground">
                {skill?.name || ""}
              </div>
              {detail && (
                <div className="text-base leading-[1.32] text-foreground">{detail}</div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
};

const CertificationsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.certifications);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Certifications"} showHeader={showHeader}>
      <div className="grid grid-cols-3 gap-x-5 gap-y-1.5">
        {itemsToRender.map((item) => (
          <div
            key={item?.id}
            data-pagination-item={item?.id}
            className="flex gap-x-1.5 text-base leading-snug"
          >
            <span className="text-foreground">•</span>
            <span className="text-foreground">
              {item?.name || ""}
              {item?.issuer && <span className={FAINT}> ({item.issuer})</span>}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
};

const LanguagesSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Languages"} showHeader={showHeader}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-1.5">
        {itemsToRender.map((item) => (
          <div
            key={item?.id}
            data-pagination-item={item?.id}
            className="flex items-baseline justify-between gap-2 text-base leading-snug"
          >
            <span className="font-bold text-foreground">{item?.name || ""}</span>
            {item?.description && <span className={META}>{item.description}</span>}
          </div>
        ))}
      </div>
    </Section>
  );
};

const AwardsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.awards);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Awards"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead primary={item?.title} secondary={item?.awarder} date={item?.date} />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const VolunteerSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Volunteering"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead
            primary={item?.position}
            secondary={item?.organization}
            date={item?.date}
            location={item?.location}
          />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const PublicationsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Publications"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead primary={item?.name} secondary={item?.publisher} date={item?.date} />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const InterestsSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "Interests"} showHeader={showHeader}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-1.5">
        {itemsToRender.map((item) => (
          <div
            key={item?.id}
            data-pagination-item={item?.id}
            className="text-base leading-snug"
          >
            <span className="font-bold text-foreground">{item?.name || ""}</span>
            {item?.keywords && item.keywords.length > 0 && (
              <span className={META}> {item.keywords.join(", ")}</span>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

const ReferencesSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);
  const { itemsToRender, slice, showHeader } = useSectionItems(section.id, section?.items ?? []);

  if (!section?.visible || !section?.items?.length) return null;
  if (slice && itemsToRender.length === 0) return null;

  return (
    <Section id={section.id} title={section.name || "References"} showHeader={showHeader}>
      {itemsToRender.map((item) => (
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
          <EntryHead primary={item?.name} secondary={item?.description} />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

const mapSectionToComponent = (section: string) => {
  switch (section) {
    case "summary": {
      return <SummarySection />;
    }
    case "education": {
      return <EducationSection />;
    }
    case "experience": {
      return <ExperienceSection />;
    }
    case "skills": {
      return <SkillsSection />;
    }
    case "certifications": {
      return <CertificationsSection />;
    }
    case "projects": {
      return <ProjectsSection />;
    }
    case "languages": {
      return <LanguagesSection />;
    }
    case "awards": {
      return <AwardsSection />;
    }
    case "volunteer": {
      return <VolunteerSection />;
    }
    case "publications": {
      return <PublicationsSection />;
    }
    case "interests": {
      return <InterestsSection />;
    }
    case "references": {
      return <ReferencesSection />;
    }
    default: {
      return null;
    }
  }
};

export const Alx = ({ columns, isFirstPage = false }: TemplateProps) => {
  const [main = []] = columns;

  return (
    <div className="p-custom space-y-4 leading-[1.32] text-foreground">
      {isFirstPage && <Header />}

      <div data-pagination-column="0" className="space-y-4">
        {main.map((section) => (
          <React.Fragment key={section}>{mapSectionToComponent(section)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};
