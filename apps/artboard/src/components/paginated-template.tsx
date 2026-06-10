import type { SectionKey } from "@resume-space/schema";
import type { Template as TemplateName } from "@resume-space/utils";
import { pageSizeMap } from "@resume-space/utils";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  type Measurement,
  paginate,
  type PaginatedPage,
  PaginationProvider,
} from "../lib/pagination";
import { useArtboardStore } from "../store/artboard";
import { getTemplate, SINGLE_FLOW_TEMPLATES } from "../templates";
import { effectivePageMargin, MM_TO_PX, Page } from "./page";

type Props = {
  mode: "preview" | "builder";
};

export const PaginatedTemplate = ({ mode }: Props) => {
  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const template = useArtboardStore((state) => state.resume.metadata.template as TemplateName);
  const page = useArtboardStore((state) => state.resume.metadata.page);

  const Template = useMemo(() => getTemplate(template), [template]);

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PaginatedPage[] | null>(null);
  const [measureSeed, setMeasureSeed] = useState(0);
  const [needsMeasure, setNeedsMeasure] = useState(true);

  const columnsFlat: SectionKey[][] = useMemo(() => {
    // Templates are written for [main, sidebar] — always provide ≥2 columns
    // even when the layout metadata only defines one.
    const numColumns = Math.max(2, ...layout.map((cols) => cols.length));
    const cols: SectionKey[][] = Array.from({ length: numColumns }, () => []);
    for (const pageCols of layout) {
      for (let c = 0; c < pageCols.length; c++) {
        for (const key of pageCols[c]) {
          cols[c].push(key as SectionKey);
        }
      }
    }

    // Single-flow templates stack their columns vertically — merge everything
    // into column 0 (main order, then sidebar order, matching the visual
    // stacking) so the paginator budgets one flow against one page height.
    // Budgeting the columns independently would pack up to 2× a page of
    // content onto every page, clipped at the paper edge.
    if (SINGLE_FLOW_TEMPLATES.has(template)) {
      const merged = cols.flat();
      return [merged, ...cols.slice(1).map(() => [] as SectionKey[])];
    }

    return cols;
  }, [layout, template]);

  const resume = useArtboardStore((state) => state.resume);
  const isFirstRunRef = useRef(true);
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      setNeedsMeasure(true);
      setMeasureSeed((s) => s + 1);
      return;
    }
    const t = window.setTimeout(() => {
      setNeedsMeasure(true);
      setMeasureSeed((s) => s + 1);
    }, 150);
    return () => {
      window.clearTimeout(t);
    };
  }, [resume]);

  // Re-measure once web fonts finish loading — heights measured with the
  // fallback font desync from the real render, overflowing pages otherwise.
  useEffect(() => {
    let cancelled = false;
    const remeasure = () => {
      if (cancelled) return;
      setNeedsMeasure(true);
      setMeasureSeed((s) => s + 1);
    };

    void document.fonts.ready.then(remeasure);
    document.fonts.addEventListener("loadingdone", remeasure);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener("loadingdone", remeasure);
    };
  }, []);

  useLayoutEffect(() => {
    if (!needsMeasure) return;
    const root = measureRef.current;
    if (!root) return;

    const columnEls = Array.from(root.querySelectorAll("[data-pagination-column]"));
    const numColumns = columnsFlat.length;

    const columnMeasurements: Measurement[][] = Array.from({ length: numColumns }, () => []);

    // Per-column page-1 chrome: each column starts below different elements
    // (pikachu: main under the header, sidebar under the picture). Rect-based —
    // offsetTop is relative to the nearest positioned ancestor and lies inside
    // templates that wrap a column in `relative` (e.g. azurill).
    const rootTop = root.getBoundingClientRect().top;
    const columnOffsets: number[] = Array.from({ length: numColumns }, () => 0);

    for (const colEl of columnEls) {
      const colIndex = Number((colEl as HTMLElement).dataset.paginationColumn);
      if (Number.isNaN(colIndex) || colIndex < 0 || colIndex >= numColumns) continue;

      columnOffsets[colIndex] = Math.round(colEl.getBoundingClientRect().top - rootTop);

      const sectionEls = Array.from(
        colEl.querySelectorAll("[data-pagination-section]"),
      ) as HTMLElement[];

      for (const sectionEl of sectionEls) {
        const sectionId = sectionEl.dataset.paginationSection ?? "";
        const headerEl = sectionEl.querySelector(
          "[data-pagination-header]",
        ) as HTMLElement | null;
        const itemEls = Array.from(
          sectionEl.querySelectorAll("[data-pagination-item]"),
        ) as HTMLElement[];
        const gapAttr = sectionEl.dataset.paginationGap;
        const gapY = gapAttr ? Number(gapAttr) : 12;

        // Header cost = measured distance from header top to first item top.
        // This captures the real header→content gap (margins included) and is
        // 0 for side-label templates (bronzor/nosepass summary) where the
        // label sits BESIDE the content and costs no vertical space. The
        // legacy `height + 12` guess over-reserved both cases.
        let headerHeight = 0;
        if (headerEl) {
          headerHeight = headerEl.offsetHeight + 12;
          if (itemEls.length > 0) {
            headerHeight = Math.max(
              0,
              Math.round(
                itemEls[0].getBoundingClientRect().top - headerEl.getBoundingClientRect().top,
              ),
            );
          }
        }

        columnMeasurements[colIndex].push({
          sectionId,
          headerHeight,
          gapY: Number.isFinite(gapY) ? gapY : 12,
          items: itemEls.map((el) => ({
            id: el.dataset.paginationItem ?? "",
            height: el.offsetHeight,
            // Row detection for grid sections: items sharing a vertical
            // position are budgeted as one row, not stacked heights.
            top: Math.round(el.getBoundingClientRect().top),
          })),
        });
      }
    }

    const pageSizeMm = pageSizeMap[page.format];
    const margin = effectivePageMargin(page.margin);
    // Never pack content flush against the bottom margin line — professional
    // layouts (FlowCV) always leave breathing room above the paper edge. This
    // also absorbs small measurement drift so ink can't creep into the margin.
    const BOTTOM_BREATHING_ROOM = 28;
    const usablePageHeight = pageSizeMm.height * MM_TO_PX - margin * 2 - BOTTOM_BREATHING_ROOM;
    const firstPageOffsets = columnOffsets.map((top) => Math.max(0, top - margin));

    // Debug hook for the render-resume tooling (harmless in production).
    (window as unknown as Record<string, unknown>).__paginationDebug = {
      columnMeasurements,
      usablePageHeight,
      firstPageOffsets,
    };

    const computed = paginate({
      pageHeightPx: usablePageHeight,
      columns: columnMeasurements,
      sectionGapY: 16,
      firstPageOffsetPx: firstPageOffsets,
    });

    setPages(computed.length > 0 ? computed : [{ columns: columnMeasurements.map(() => []) }]);
    setNeedsMeasure(false);
  }, [needsMeasure, columnsFlat, page.format, page.margin, measureSeed]);

  const measurementContainer = needsMeasure ? (
    <div
      ref={measureRef}
      style={{
        position: "absolute",
        top: 0,
        left: -99999,
        width: `${pageSizeMap[page.format].width * MM_TO_PX}px`,
        visibility: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <Template isFirstPage columns={columnsFlat} />
    </div>
  ) : null;

  if (pages === null) {
    return measurementContainer;
  }

  return (
    <>
      {measurementContainer}
      {pages.map((pageData, pageIndex) => {
        const sliceMap: Record<string, { start: number; end: number; showHeader: boolean }> = {};
        const columnsForTemplate: SectionKey[][] = pageData.columns.map((col) =>
          col.map((entry) => {
            sliceMap[entry.sectionId] = entry.slice;
            return entry.sectionId as SectionKey;
          }),
        );

        while (columnsForTemplate.length < columnsFlat.length) {
          columnsForTemplate.push([]);
        }

        return (
          <PaginationProvider key={pageIndex} value={{ sections: sliceMap }}>
            <Page mode={mode} pageNumber={pageIndex + 1}>
              <Template isFirstPage={pageIndex === 0} columns={columnsForTemplate} />
            </Page>
          </PaginationProvider>
        );
      })}
    </>
  );
};
