import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <MoralisProvider
        appId={"kPMKjTtqNsVgtEcz9CKfAA22Xm84y4KLttSPBlAe"}
        serverUrl="https://ovv9rqf8harw.usemoralis.com:2053/server"
      >
        <Component {...pageProps} />
      </MoralisProvider>
    </SessionProvider>
  );
}

export default MyApp;
