import "@/styles/globals.css";
import "@/styles/tailwind.css";
import "../lib/opdf/styles/index.css";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
