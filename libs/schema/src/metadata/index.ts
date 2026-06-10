import { z } from "zod";

// Every page is ALWAYS [main, sidebar] — the layout editor, drag-and-drop
// locators and templates all assume two columns. A single-column flow is an
// EMPTY sidebar, never a missing one (a 1-column page crashes the builder's
// Layout panel).
export const defaultLayout = [
  [
    [
      "summary",
      "experience",
      "education",
      "projects",
      "skills",
      "certifications",
      "languages",
      "awards",
      "publications",
      "volunteer",
      "interests",
      "references",
    ],
    [],
  ],
];

// Schema
export const metadataSchema = z.object({
  template: z.string().default("alx"),
  layout: z.array(z.array(z.array(z.string()))).default(defaultLayout), // pages -> columns -> sections
  css: z.object({
    value: z.string().default("* {\n\toutline: 1px solid #000;\n\toutline-offset: 4px;\n}"),
    visible: z.boolean().default(false),
  }),
  page: z.object({
    margin: z.number().default(48),
    format: z.enum(["a4", "letter"]).default("a4"),
    options: z.object({
      breakLine: z.boolean().default(false),
      pageNumbers: z.boolean().default(false),
    }),
  }),
  theme: z.object({
    background: z.string().default("#ffffff"),
    text: z.string().default("#1a1a1a"),
    primary: z.string().default("#1f2937"),
  }),
  typography: z.object({
    font: z.object({
      family: z.string().default("Source Sans 3"),
      subset: z.string().default("latin"),
      variants: z.array(z.string()).default(["regular", "italic", "600", "700"]),
      size: z.number().default(13),
    }),
    lineHeight: z.number().default(1.45),
    hideIcons: z.boolean().default(false),
    underlineLinks: z.boolean().default(false),
  }),
  notes: z.string().default(""),
});

// Type
export type Metadata = z.infer<typeof metadataSchema>;

// Defaults
export const defaultMetadata: Metadata = {
  template: "alx",
  layout: defaultLayout,
  css: {
    value: "* {\n\toutline: 1px solid #000;\n\toutline-offset: 4px;\n}",
    visible: false,
  },
  page: {
    margin: 48,
    format: "a4",
    options: {
      breakLine: false,
      pageNumbers: false,
    },
  },
  theme: {
    background: "#ffffff",
    text: "#1a1a1a",
    primary: "#1f2937",
  },
  typography: {
    font: {
      family: "Source Sans 3",
      subset: "latin",
      variants: ["regular", "italic", "600", "700"],
      size: 13,
    },
    lineHeight: 1.45,
    hideIcons: false,
    underlineLinks: false,
  },
  notes: "",
};
