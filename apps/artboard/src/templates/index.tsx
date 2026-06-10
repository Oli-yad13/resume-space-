import type { Template } from "@resume-space/utils";

import { Alx } from "./alx";
import { Azurill } from "./azurill";
import { Bronzor } from "./bronzor";
import { Chikorita } from "./chikorita";
import { Ditto } from "./ditto";
import { Gengar } from "./gengar";
import { Glalie } from "./glalie";
import { Kakuna } from "./kakuna";
import { Leafish } from "./leafish";
import { Nosepass } from "./nosepass";
import { Onyx } from "./onyx";
import { Pikachu } from "./pikachu";
import { Rhyhorn } from "./rhyhorn";

// Templates that render their columns stacked in ONE vertical flow (no
// side-by-side sidebar). For these, the paginator must merge every layout
// column into a single flow — budgeting columns independently would put up
// to 2× a page of content on each page and clip it at the paper edge.
export const SINGLE_FLOW_TEMPLATES: ReadonlySet<Template> = new Set([
  "alx",
  "bronzor",
  "kakuna",
  "nosepass",
  "onyx",
  "rhyhorn",
] as Template[]);

export const getTemplate = (template: Template) => {
  switch (template) {
    case "alx": {
      return Alx;
    }
    case "azurill": {
      return Azurill;
    }
    case "bronzor": {
      return Bronzor;
    }
    case "chikorita": {
      return Chikorita;
    }
    case "ditto": {
      return Ditto;
    }
    case "gengar": {
      return Gengar;
    }
    case "glalie": {
      return Glalie;
    }
    case "kakuna": {
      return Kakuna;
    }
    case "leafish": {
      return Leafish;
    }
    case "nosepass": {
      return Nosepass;
    }
    case "onyx": {
      return Onyx;
    }
    case "pikachu": {
      return Pikachu;
    }
    case "rhyhorn": {
      return Rhyhorn;
    }
    default: {
      return Onyx;
    }
  }
};
