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
import { getTemplate } from "../templates";
import { MM_TO_PX, Page } from "./page";

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
    const numColumns = Math.max(1, ...layout.map((cols) => cols.length));
    const cols: SectionKey[][] = Array.from({ length: numColumns }, () => []);
    for (const pageCols of layout) {
      for (let c = 0; c < pageCols.length; c++) {
        for (const key of pageCols[c]) {
          cols[c].push(key as SectionKey);
        }
      }
    }
    return cols;
  }, [layout]);

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

  useLayoutEffect(() => {
    if (!needsMeasure) return;
    const root = measureRef.current;
    if (!root) return;

    const columnEls = Array.from(root.querySelectorAll("[data-pagination-column]"));
    const numColumns = columnsFlat.length;

    const columnMeasurements: Measurement[][] = Array.from({ length: numColumns }, () => []);

    const firstColumnTop = columnEls.length > 0
      ? (columnEls[0] as HTMLElement).offsetTop
      : 0;

    for (const colEl of columnEls) {
      const colIndex = Number((colEl as HTMLElement).dataset.paginationColumn);
      if (Number.isNaN(colIndex) || colIndex < 0 || colIndex >= numColumns) continue;

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

        columnMeasurements[colIndex].push({
          sectionId,
          headerHeight: headerEl ? headerEl.offsetHeight + 8 : 0,
          gapY: Number.isFinite(gapY) ? gapY : 12,
          items: itemEls.map((el) => ({
            id: el.dataset.paginationItem ?? "",
            height: el.offsetHeight,
          })),
        });
      }
    }

    const pageSizeMm = pageSizeMap[page.format];
    const usablePageHeight = pageSizeMm.height * MM_TO_PX - page.margin * 2;
    const firstPageOffset = Math.max(0, firstColumnTop - page.margin);

    const computed = paginate({
      pageHeightPx: usablePageHeight,
      columns: columnMeasurements,
      sectionGapY: 16,
      firstPageOffsetPx: firstPageOffset,
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
