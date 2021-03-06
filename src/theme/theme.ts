const BREAKPOINTS = ["40em", "52em", "64em", "1088px"];
const FONT_SIZES = [12, 14, 16, 20, 24, 32, 48, 64, 72];
const SPACES = [0, 4, 8, 16, 32, 64, 128, 256, 512];

export const breakpointSize = (index: 0 | 1 | 2 | "max-width") =>
  BREAKPOINTS[index === "max-width" ? 3 : index];

export const breakpoint = (index: 0 | 1 | 2 | "max-width") =>
  `@media screen and (min-width: ${
    BREAKPOINTS[index === "max-width" ? 3 : index]
  })`;

export const fontSize = (index: SizeArg) => (FONT_SIZES[index] ?? index) + "px";

export const space = (index: SizeArg) => (SPACES?.[index] ?? index) + "px";

type SizeArg = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
