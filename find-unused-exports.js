const findUnusedExports = require("ts-unused-exports").default;

const NEXT_PAGES = ["src/pages/"];
const IGNORE_EXPORTS_IN_NEXT_PAGES = [
  "getStaticProps",
  "getServerSideProps",
  "default",
];

const consoleColors = Object.freeze({
  info: "\x1b[34m%s\x1b[0m",
  warning: "\x1b[33m%s\x1b[0m",
  text: "\x1b[36m%s\x1b[0m",
  success: "\x1b[32m%s\x1b[0m",
});

const resultUnusedExports = findUnusedExports("./tsconfig.json", [
  "--excludePathsFromReport=node_modules",
  "--searchNamespaces",
  "--showLineNumber",
]);

console.log(consoleColors.info, "Check unused exports 🔍");

const report = Object.keys(resultUnusedExports).reduce((acc, currFileName) => {
  const isNextJSPage = isSomeStringFromListIncludedInString(
    NEXT_PAGES,
    currFileName
  );

  if (isNextJSPage) {
    const filteredExports = resultUnusedExports[currFileName].filter(
      ({ exportName }) => !IGNORE_EXPORTS_IN_NEXT_PAGES.includes(exportName)
    );

    return filteredExports.length > 0
      ? [
          ...acc,
          {
            fileName: currFileName,
            unusedExports: filteredExports,
          },
        ]
      : acc;
  }

  return [
    ...acc,
    {
      fileName: currFileName,
      unusedExports: resultUnusedExports[currFileName],
    },
  ];
}, []);

if (report.length === 0) {
  console.log(consoleColors.success, "All is fine! 😍");
  return process.exit(0);
} else {
  console.info(consoleColors.warning, "I found some unused exports 😥\n");

  report.forEach(({ fileName, unusedExports }) => {
    console.log(consoleColors.text, `In file:\t ${fileName}`);

    unusedExports.forEach(({ location, exportName }) => {
      const lineNumber = location?.line;

      console.log(
        `Export:\t "${exportName}" ${lineNumber ? `on line ${lineNumber}` : ""}`
      );
    });
    console.log("\n");
  });
  return process.exit(1);
}

function isSomeStringFromListIncludedInString(listWithStrings, string) {
  return listWithStrings.some((stringFromList) =>
    string.includes(stringFromList)
  );
}
