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
  items: { id: string; height: number }[];
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
  firstPageOffsetPx?: number;
};

export const paginate = ({
  pageHeightPx,
  columns,
  sectionGapY,
  firstPageOffsetPx = 0,
}: PaginateArgs): PaginatedPage[] => {
  const numColumns = columns.length;
  const perColumnPages: PaginatedColumn[][] = columns.map((sections) =>
    packColumn(sections, pageHeightPx, sectionGapY, firstPageOffsetPx),
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

    let itemIndex = 0;
    let showHeader = true;

    while (itemIndex < section.items.length) {
      const remainingPage = pageHeightPx - currentHeight;
      const headerCost = showHeader ? section.headerHeight : 0;

      let consumed = headerCost;
      let endIndex = itemIndex;

      while (endIndex < section.items.length) {
        const itemHeight = section.items[endIndex].height;
        const isFirstItem = endIndex === itemIndex;
        const tentative = isFirstItem
          ? headerCost + itemHeight
          : consumed + section.gapY + itemHeight;
        if (tentative > remainingPage) break;
        consumed = tentative;
        endIndex++;
      }

      if (endIndex > itemIndex) {
        const currentPage = pages[pages.length - 1];
        currentPage.push({
          sectionId: section.sectionId,
          slice: { start: itemIndex, end: endIndex, showHeader },
        });
        currentHeight += consumed + sectionGapY;
        itemIndex = endIndex;
        showHeader = false;
      } else {
        const currentPage = pages[pages.length - 1];
        if (currentPage.length === 0) {
          currentPage.push({
            sectionId: section.sectionId,
            slice: { start: itemIndex, end: itemIndex + 1, showHeader },
          });
          itemIndex++;
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
