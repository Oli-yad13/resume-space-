import { cn, isUrl, sanitize } from "@resume-space/utils";
import React from "react";

import { BrandIcon } from "../components/brand-icon";
import { useSectionSlice } from "../lib/pagination";
import { useArtboardStore } from "../store/artboard";
import type { TemplateProps } from "../types/template";

// FlowCV-inspired neutral palette: near-black headings, soft grays for meta.
const META = "text-gray-500";
const SUBTLE = "text-gray-600";

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
    <div className="space-y-2.5">
      <div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
          {basics?.name || ""}
        </h1>
        {basics?.headline && (
          <div className={cn("mt-0.5 text-base", SUBTLE)}>{basics.headline}</div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {basics?.email && (
          <ContactItem icon={<i className="ph ph-bold ph-envelope" />} href={`mailto:${basics.email}`}>
            {basics.email}
          </ContactItem>
        )}
        {basics?.phone && (
          <ContactItem icon={<i className="ph ph-bold ph-phone" />} href={`tel:${basics.phone}`}>
            {basics.phone}
          </ContactItem>
        )}
        {basics?.location && (
          <ContactItem icon={<i className="ph ph-bold ph-map-pin" />}>{basics.location}</ContactItem>
        )}
        {basics?.url && isUrl(basics.url.href) && (
          <ContactItem icon={<i className="ph ph-bold ph-link" />} href={basics.url.href}>
            {basics.url.label || basics.url.href}
          </ContactItem>
        )}
        {profiles?.items?.map(
          (profile, index) =>
            profile?.url &&
            isUrl(profile.url.href) && (
              <ContactItem
                key={index}
                icon={<BrandIcon slug={profile.icon} />}
                href={profile.url.href}
              >
                {profile.username || profile.url.label || profile.url.href}
              </ContactItem>
            ),
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
  <section data-pagination-section={id} data-pagination-gap={16} className="space-y-3">
    {showHeader && (
      <div data-pagination-header>
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">{title}</h2>
        <div className="mt-1 h-px w-full bg-foreground" />
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </section>
);

// A two-column header row: bold primary + italic secondary on the left,
// date and location stacked and right-aligned (FlowCV layout).
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
    <div className="text-sm">
      {primary && <span className="font-bold text-foreground">{primary}</span>}
      {primary && secondary && ", "}
      {secondary && <span className="italic">{secondary}</span>}
    </div>
    {(date || location) && (
      <div className={cn("shrink-0 text-right text-sm leading-tight", META)}>
        {date && <div>{date}</div>}
        {location && <div>{location}</div>}
      </div>
    )}
  </div>
);

const RichText = ({ content }: { content?: string }) =>
  content ? (
    <div
      className="wysiwyg text-sm leading-relaxed"
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
    <Section id={section.id} title={section.name || "Summary"} showHeader={!slice || slice.showHeader}>
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
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-1">
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
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-1">
          <EntryHead
            primary={[item?.studyType, item?.area].filter(Boolean).join(" ").trim() || item?.area}
            secondary={item?.institution}
            date={item?.date}
          />
          {item?.score && <div className={cn("text-sm", SUBTLE)}>{item.score}</div>}
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
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-1">
          <EntryHead primary={item?.name} secondary={item?.description} date={item?.date} />
          {item?.url && isUrl(item.url.href) && (
            <a
              href={item.url.href}
              target="_blank"
              rel="noreferrer"
              className={cn("text-sm", META)}
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
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {itemsToRender.map((skill) => {
          const detail =
            skill?.keywords && skill.keywords.length > 0
              ? skill.keywords.join(", ")
              : skill?.description;
          return (
            <div key={skill?.id} data-pagination-item={skill?.id} className="space-y-0.5">
              <div className="text-sm font-bold text-foreground">{skill?.name || ""}</div>
              {detail && <div className={cn("text-sm leading-snug", SUBTLE)}>{detail}</div>}
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
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {itemsToRender.map((item) => (
          <div key={item?.id} data-pagination-item={item?.id} className="space-y-0.5">
            <div className="text-sm font-bold text-foreground">{item?.name || ""}</div>
            {item?.issuer && <div className={cn("text-sm", SUBTLE)}>{item.issuer}</div>}
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
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {itemsToRender.map((item) => (
          <div
            key={item?.id}
            data-pagination-item={item?.id}
            className="flex items-baseline justify-between gap-2"
          >
            <span className="text-sm font-medium text-foreground">{item?.name || ""}</span>
            {item?.description && <span className={cn("text-sm", META)}>{item.description}</span>}
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
        <div key={item?.id} data-pagination-item={item?.id} className="space-y-1">
          <EntryHead primary={item?.title} secondary={item?.awarder} date={item?.date} />
          <RichText content={item?.summary} />
        </div>
      ))}
    </Section>
  );
};

export const Alx = ({ isFirstPage = false }: TemplateProps) => {
  return (
    <div className="p-custom space-y-5 text-foreground">
      {isFirstPage && <Header />}

      <div data-pagination-column="0" className="space-y-4">
        <SummarySection />
        <EducationSection />
        <ExperienceSection />
        <SkillsSection />
        <CertificationsSection />
        <ProjectsSection />
        <LanguagesSection />
        <AwardsSection />
      </div>
    </div>
  );
};
