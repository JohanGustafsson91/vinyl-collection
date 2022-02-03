import "@testing-library/jest-dom/extend-expect";
import "cross-fetch/polyfill";

import { configure } from "@testing-library/dom";
import fetch from "node-fetch";

window.fetch = (url, ...rest) =>
  fetch(/^https?:/.test(url) ? url : new URL(url, "http://localhost"), ...rest);

configure({
  asyncUtilTimeout: 5000,
});
