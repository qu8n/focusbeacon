import React, { useState } from "react";
import PropTypes from "prop-types";
import { QueryClient, QueryClientProvider } from "react-query";
import Head from "next/head";
import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* https://realfavicongenerator.net/ */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e9520e" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta
          name="description"
          content="Unofficial Focusmate metrics dashboard"
        />
        {/* manifest.json provides metadata used when your web app is installed on a user's mobile device or desktop */}
        <link rel="manifest" href="/manifest.json" />
        <title>
          FocusBeacon - Focusmate&apos;s Unofficial Metrics & Statistics
          Dashboard
        </title>
        <meta
          name="description"
          content="Unlock your Focusmate metrics and stats including milestones, session trends, hours of sessions, and more. 100% free."
          key="desc"
        />
      </Head>

      <NavBar
        setShowAboutModal={setShowAboutModal}
        setShowPrivacyModal={setShowPrivacyModal}
      />

      {(showAboutModal || showPrivacyModal) && (
        <Modal
          modalType={showAboutModal ? "about" : "privacy"}
          setShowAboutModal={setShowAboutModal}
          setShowPrivacyModal={setShowPrivacyModal}
        />
      )}

      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
