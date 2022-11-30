import "@testing-library/jest-dom/extend-expect";
import "cross-fetch/polyfill";

// @ts-expect-error
import preloadAll from "jest-next-dynamic";
// @ts-expect-error
import fetch from "node-fetch";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
// @ts-expect-error
global.TextDecoder = TextDecoder;

// @ts-expect-error
window.fetch = (url: string, ...rest: any[]) =>
  fetch(/^https?:/.test(url) ? url : new URL(url, "http://localhost"), ...rest);

beforeAll(() => {
  // Render dynamic imported components in unit tests
  preloadAll();
});
