import "@testing-library/jest-dom/extend-expect";
import "cross-fetch/polyfill";

import fetch from "node-fetch";

window.fetch = (url: string, ...rest: any[]) =>
  fetch(/^https?:/.test(url) ? url : new URL(url, "http://localhost"), ...rest);
