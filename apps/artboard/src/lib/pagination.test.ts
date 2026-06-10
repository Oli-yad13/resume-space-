import { describe, expect, it } from "vitest";

import { type Measurement, paginate } from "./pagination";

const section = (id: string, itemHeights: number[]): Measurement => ({
  sectionId: id,
  headerHeight: 24,
  gapY: 12,
  items: itemHeights.map((h, i) => ({ id: `${id}-${i}`, height: h })),
});

describe("paginate", () => {
  it("returns at least one page when there is no content", () => {
    const pages = paginate({ pageHeightPx: 1000, columns: [[]], sectionGapY: 16 });
    expect(pages).toHaveLength(1);
    expect(pages[0].columns).toEqual([[]]);
  });

  it("packs everything onto one page when it fits", () => {
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [[section("exp", [100, 100, 100])]],
      sectionGapY: 16,
    });
    expect(pages).toHaveLength(1);
    expect(pages[0].columns[0]).toHaveLength(1);
    expect(pages[0].columns[0][0]).toEqual({
      sectionId: "exp",
      slice: { start: 0, end: 3, showHeader: true },
    });
  });

  it("spills items onto a second page without a gap", () => {
    // page 1 budget: 1000
    // section: header 24 + 5×200 + 4×12 = 1072 → first 4 fit (24+800+36=860), 5th spills
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [[section("exp", [200, 200, 200, 200, 200])]],
      sectionGapY: 16,
    });
    expect(pages).toHaveLength(2);
    expect(pages[0].columns[0][0]).toEqual({
      sectionId: "exp",
      slice: { start: 0, end: 4, showHeader: true },
    });
    expect(pages[1].columns[0][0]).toEqual({
      sectionId: "exp",
      slice: { start: 4, end: 5, showHeader: false },
    });
  });

  it("hides the header on continued pages", () => {
    const pages = paginate({
      pageHeightPx: 500,
      columns: [[section("exp", [200, 200, 200])]],
      sectionGapY: 16,
    });
    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0].columns[0][0].slice.showHeader).toBe(true);
    expect(pages[1].columns[0][0].slice.showHeader).toBe(false);
  });

  it("does not include previous sections again on later pages", () => {
    const pages = paginate({
      pageHeightPx: 500,
      columns: [
        [
          section("summary", [100]),
          section("exp", [200, 200, 200]),
        ],
      ],
      sectionGapY: 16,
    });

    expect(pages[0].columns[0].some((entry) => entry.sectionId === "summary")).toBe(true);
    expect(pages[1].columns[0].some((entry) => entry.sectionId === "summary")).toBe(false);
    expect(pages[1].columns[0][0]).toEqual({
      sectionId: "exp",
      slice: { start: 1, end: 3, showHeader: false },
    });
  });

  it("packs multiple sections in order across pages", () => {
    // page 1: 800, header 24 + 2×300 + 12 = 636 fits, next section starts after sectionGap
    // sectionGap=20, so used = 636+20 = 656, remaining = 144 → no full section header fits
    const pages = paginate({
      pageHeightPx: 800,
      columns: [
        [
          section("a", [300, 300]),
          section("b", [200, 200, 200]),
        ],
      ],
      sectionGapY: 20,
    });
    // both items of "a" should be on page 1
    expect(pages[0].columns[0].find((s) => s.sectionId === "a")?.slice).toEqual({
      start: 0,
      end: 2,
      showHeader: true,
    });
    // "b" should have started on page 1 or 2 depending on slack
    const bSlicePage1 = pages[0].columns[0].find((s) => s.sectionId === "b");
    const bSlicePage2 = pages[1]?.columns[0].find((s) => s.sectionId === "b");
    const totalB = (bSlicePage1?.slice.end ?? 0) + (bSlicePage2?.slice.end ?? 0) - (bSlicePage1?.slice.start ?? 0) - (bSlicePage2?.slice.start ?? 0);
    expect(totalB).toBe(3);
  });

  it("force-fits an item that is taller than the page", () => {
    const pages = paginate({
      pageHeightPx: 200,
      columns: [[section("exp", [500, 100])]],
      sectionGapY: 16,
    });
    // first item (500px) doesn't fit but is the only thing on page 1 → force-fit
    expect(pages[0].columns[0][0].slice).toEqual({
      start: 0,
      end: 1,
      showHeader: true,
    });
    // second item lands on page 2
    expect(pages[1].columns[0][0].slice.start).toBe(1);
    expect(pages[1].columns[0][0].slice.end).toBe(2);
  });

  it("handles independent column flows", () => {
    const pages = paginate({
      pageHeightPx: 500,
      columns: [
        [section("a", [200, 200, 200])], // column 0 needs 2 pages
        [section("b", [100, 100])], // column 1 needs 1 page
      ],
      sectionGapY: 16,
    });
    expect(pages.length).toBeGreaterThanOrEqual(2);
    // column 1 should be populated on page 1, empty on page 2
    expect(pages[0].columns[1]).toHaveLength(1);
    expect(pages[1].columns[1]).toEqual([]);
  });

  it("respects firstPageOffsetPx (reserved space for header chrome)", () => {
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [[section("exp", [200, 200, 200, 200])]],
      sectionGapY: 16,
      firstPageOffsetPx: 600, // page 1 only has 400px left
    });
    // page 1: 400 budget, header 24 + 1×200 = 224, next would be 224+12+200=436 > 400 → 1 item
    expect(pages[0].columns[0][0].slice).toEqual({
      start: 0,
      end: 1,
      showHeader: true,
    });
    // page 2: full 1000 budget, remaining 3 items fit
    expect(pages[1].columns[0][0].slice).toEqual({
      start: 1,
      end: 4,
      showHeader: false,
    });
  });

  it("applies per-column first-page offsets independently", () => {
    // Column 0 sits under a 600px header (page 1 budget 400) while column 1
    // starts at the top (full 1000) — like pikachu's main vs sidebar.
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [
        [section("main", [200, 200, 200, 200])],
        [section("side", [200, 200, 200, 200])],
      ],
      sectionGapY: 16,
      firstPageOffsetPx: [600, 0],
    });
    // main: page 1 = 400 budget → header 24 + 200 = 224 fits, +12+200=436 > 400 → 1 item
    expect(pages[0].columns[0][0].slice).toEqual({ start: 0, end: 1, showHeader: true });
    // side: full budget → all 4 items fit (24 + 4×200 + 3×12 = 860)
    expect(pages[0].columns[1][0].slice).toEqual({ start: 0, end: 4, showHeader: true });
  });

  it("budgets grid items sharing a row only once", () => {
    // 6 items in a 2-col grid → 3 rows of 100px each.
    // Budget: header 24 + 3×100 + 2×12 = 348 — fits a 400px page even though
    // stacked heights (24 + 600 + 60 = 684) would not.
    const grid: Measurement = {
      sectionId: "skills",
      headerHeight: 24,
      gapY: 12,
      items: [
        { id: "s0", height: 100, top: 0 },
        { id: "s1", height: 100, top: 0 },
        { id: "s2", height: 100, top: 112 },
        { id: "s3", height: 100, top: 112 },
        { id: "s4", height: 100, top: 224 },
        { id: "s5", height: 100, top: 224 },
      ],
    };
    const pages = paginate({ pageHeightPx: 400, columns: [[grid]], sectionGapY: 16 });
    expect(pages).toHaveLength(1);
    expect(pages[0].columns[0][0]).toEqual({
      sectionId: "skills",
      slice: { start: 0, end: 6, showHeader: true },
    });
  });

  it("splits grid sections only at row boundaries", () => {
    // 2 rows of 2; uneven heights within a row → row height = max.
    // Page: 24 (header) + 150 (row 1) = 174 fits in 200; +12+150 = 336 > 200 → row 2 spills whole.
    const grid: Measurement = {
      sectionId: "skills",
      headerHeight: 24,
      gapY: 12,
      items: [
        { id: "s0", height: 100, top: 0 },
        { id: "s1", height: 150, top: 0 },
        { id: "s2", height: 150, top: 162 },
        { id: "s3", height: 100, top: 162 },
      ],
    };
    const pages = paginate({ pageHeightPx: 200, columns: [[grid]], sectionGapY: 16 });
    expect(pages).toHaveLength(2);
    // page 1 carries the full first row (items 0-1), never a lone half-row
    expect(pages[0].columns[0][0].slice).toEqual({ start: 0, end: 2, showHeader: true });
    expect(pages[1].columns[0][0].slice).toEqual({ start: 2, end: 4, showHeader: false });
  });

  it("keeps a small section together instead of stranding an orphan row", () => {
    // Page 1: filler consumes most of the page (24 + 870 + 16 gap = 910, leaves 90).
    // "certs": header 24 + row 40 = 64 fits in 90, but the second row (64+12+40 =
    // 116 > 90) would orphan onto page 2 without its header. Full cost 116 ≤ 1000
    // and the fitting slice (64) ≤ 350 (35% of 1000) → whole section moves to
    // page 2 with its header.
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [
        [
          section("filler", [870]),
          {
            sectionId: "certs",
            headerHeight: 24,
            gapY: 12,
            items: [
              { id: "c0", height: 40 },
              { id: "c1", height: 40 },
            ],
          },
        ],
      ],
      sectionGapY: 16,
    });
    expect(pages).toHaveLength(2);
    expect(pages[0].columns[0].some((s) => s.sectionId === "certs")).toBe(false);
    expect(pages[1].columns[0][0]).toEqual({
      sectionId: "certs",
      slice: { start: 0, end: 2, showHeader: true },
    });
  });

  it("still splits large sections rather than wasting page space", () => {
    // "exp" starts on page 1 with 700px remaining; 3 of 5 rows fit (24+3×200+2×12
    // = 648 > 350 waste threshold) → split, do NOT push the whole section down.
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [
        [
          section("filler", [250]),
          section("exp", [200, 200, 200, 200, 200]),
        ],
      ],
      sectionGapY: 16,
    });
    const expPage1 = pages[0].columns[0].find((s) => s.sectionId === "exp");
    expect(expPage1).toBeDefined();
    expect(expPage1?.slice.start).toBe(0);
    expect(expPage1?.slice.end).toBeGreaterThan(0);
  });

  it("skips empty sections", () => {
    const pages = paginate({
      pageHeightPx: 1000,
      columns: [[section("empty", []), section("real", [100])]],
      sectionGapY: 16,
    });
    expect(pages).toHaveLength(1);
    expect(pages[0].columns[0]).toHaveLength(1);
    expect(pages[0].columns[0][0].sectionId).toBe("real");
  });
});
