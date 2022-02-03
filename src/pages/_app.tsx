import "styles/globals.css";

import { AppProps } from "next/app";

// if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
//  require("../api/mocks");
// }

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
