import { createContext, useContext } from "react";

export type SectionSlice = {
  start: number;
  end: number;
  showHeader: boolean;
};

export type PaginationSlice = {
  sections: Record<string, SectionSlice>;
};

const PaginationContext = createContext<PaginationSlice | null>(null);

export const PaginationProvider = PaginationContext.Provider;

export const useSectionSlice = (sectionId: string): SectionSlice | null => {
  const ctx = useContext(PaginationContext);
  if (!ctx) return null;
  return ctx.sections[sectionId] ?? null;
};

export const usePaginationActive = (): boolean => {
  return useContext(PaginationContext) !== null;
};

export type Measurement = {
  sectionId: string;
  headerHeight: number;
  // `top` is the measured vertical offset of the item; items sharing a top
  // sit on the same row of a multi-column grid and must be budgeted once.
  items: { id: string; height: number; top?: number }[];
  gapY: number;
};

export type PaginatedColumn = Array<{
  sectionId: string;
  slice: SectionSlice;
}>;

export type PaginatedPage = {
  columns: PaginatedColumn[];
};

type PaginateArgs = {
  pageHeightPx: number;
  columns: Measurement[][];
  sectionGapY: number;
  // Page-1 chrome (header band, picture) each column sits below. Columns can
  // start at different heights — e.g. pikachu's main column begins under the
  // header while its sidebar begins under the picture — so a single shared
  // offset under-budgets one of them and packs content past the page bottom.
  firstPageOffsetPx?: number | number[];
};

export const paginate = ({
  pageHeightPx,
  columns,
  sectionGapY,
  firstPageOffsetPx = 0,
}: PaginateArgs): PaginatedPage[] => {
  const numColumns = columns.length;
  const offsets = Array.isArray(firstPageOffsetPx)
    ? firstPageOffsetPx
    : columns.map(() => firstPageOffsetPx);
  const perColumnPages: PaginatedColumn[][] = columns.map((sections, index) =>
    packColumn(sections, pageHeightPx, sectionGapY, offsets[index] ?? 0),
  );

  const totalPages = Math.max(1, ...perColumnPages.map((p) => p.length));
  const pages: PaginatedPage[] = [];

  for (let p = 0; p < totalPages; p++) {
    const cols: PaginatedColumn[] = [];
    for (let c = 0; c < numColumns; c++) {
      cols.push(perColumnPages[c][p] ?? []);
    }
    pages.push({ columns: cols });
  }

  return pages;
};

// Group items into visual rows: items whose measured `top` matches sit side by
// side in a grid (e.g. 2-column skills) and consume the page height only once.
// Items without a `top` each form their own row (vertical list behavior).
type Row = { start: number; end: number; height: number; top?: number };

const buildRows = (items: Measurement["items"]): Row[] => {
  const rows: Row[] = [];

  for (const [index, item] of items.entries()) {
    const lastRow = rows.at(-1);
    const sameRow =
      lastRow !== undefined &&
      lastRow.top !== undefined &&
      item.top !== undefined &&
      Math.abs(item.top - lastRow.top) < 2;

    if (sameRow) {
      lastRow.end = index + 1;
      lastRow.height = Math.max(lastRow.height, item.height);
    } else {
      rows.push({ start: index, end: index + 1, height: item.height, top: item.top });
    }
  }

  return rows;
};

const packColumn = (
  sections: Measurement[],
  pageHeightPx: number,
  sectionGapY: number,
  firstPageOffsetPx: number,
): PaginatedColumn[] => {
  const pages: PaginatedColumn[] = [[]];
  let currentHeight = firstPageOffsetPx;

  const startNewPage = () => {
    pages.push([]);
    currentHeight = 0;
  };

  for (const section of sections) {
    if (section.items.length === 0) continue;

    const rows = buildRows(section.items);

    // Keep-together: full cost of the section if rendered in one piece.
    const fullSectionCost =
      section.headerHeight +
      rows.reduce((sum, row, index) => sum + row.height + (index > 0 ? section.gapY : 0), 0);

    let rowIndex = 0;
    let showHeader = true;

    while (rowIndex < rows.length) {
      const remainingPage = pageHeightPx - currentHeight;
      const headerCost = showHeader ? section.headerHeight : 0;

      let consumed = headerCost;
      let endRow = rowIndex;

      while (endRow < rows.length) {
        const rowHeight = rows[endRow].height;
        const isFirstRow = endRow === rowIndex;
        const tentative = isFirstRow
          ? headerCost + rowHeight
          : consumed + section.gapY + rowHeight;
        if (tentative > remainingPage) break;
        consumed = tentative;
        endRow++;
      }

      // Keep-together rule: a COMPACT section (≤ ~⅓ page) that would have
      // to split here moves down whole (header + all rows) — never strand a
      // headerless orphan fragment of certifications/awards/languages on the
      // next page. Larger sections (experience, projects) split normally:
      // pushing a 45%-of-page projects section down whole leaves a huge hole
      // after the previous section, which reads worse than a continued list.
      // Waste cap ≤ 25% of the page (the FlowCV trade: it leaves ~25% of a
      // page empty to keep its certifications in one piece — never more).
      const keepTogetherMaxWaste = pageHeightPx * 0.25;
      const keepTogetherMaxSection = pageHeightPx * 0.35;
      if (
        showHeader &&
        endRow > rowIndex &&
        endRow < rows.length &&
        consumed <= keepTogetherMaxWaste &&
        fullSectionCost <= keepTogetherMaxSection &&
        pages[pages.length - 1].length > 0
      ) {
        startNewPage();
        continue;
      }

      if (endRow > rowIndex) {
        const currentPage = pages[pages.length - 1];
        currentPage.push({
          sectionId: section.sectionId,
          slice: { start: rows[rowIndex].start, end: rows[endRow - 1].end, showHeader },
        });
        currentHeight += consumed + sectionGapY;
        rowIndex = endRow;
        showHeader = false;
      } else {
        const currentPage = pages[pages.length - 1];
        if (currentPage.length === 0) {
          // Row taller than an empty page: force-fit it to guarantee progress.
          currentPage.push({
            sectionId: section.sectionId,
            slice: { start: rows[rowIndex].start, end: rows[rowIndex].end, showHeader },
          });
          rowIndex++;
          showHeader = false;
          startNewPage();
        } else {
          startNewPage();
        }
      }
    }
  }

  return pages;
};
