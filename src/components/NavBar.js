import { Disclosure } from "@headlessui/react";
import { MenuIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Logo from "./Logo";
import { useRouter } from "next/router";
import Link from "next/link";
import { oauthURL } from "../constants/oauthURL";

NavBar.propTypes = {
  setShowAboutModal: PropTypes.func.isRequired,
  setShowPrivacyModal: PropTypes.func.isRequired
};

export default function NavBar({ setShowAboutModal, setShowPrivacyModal }) {
  // TODO: This is a hacky way to check if the user is signed in. We should
  // probably use a context provider instead.
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    async function checkSignedInStatus() {
      const response = await fetch("/api/session");
      const data = await response.json();
      if (data.signedIn) {
        setIsSignedIn(true);
      }
    }
    checkSignedInStatus();
  }, [router]);

  return (
    <Disclosure as="nav" className="mb-10">
      {({ open }) => (
        <>
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <div className="relative flex justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
                <a
                  href={isSignedIn ? "/dashboard" : "/"}
                  className="flex items-center"
                >
                  <Logo />
                </a>
              </div>

              {/* Desktop menu */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  type="button"
                  onClick={() => setShowAboutModal(true)}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  Privacy
                </button>
                <Link
                  href="https://forms.gle/mcuSkyP5uguV7FKd7"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  Report a bug
                </Link>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/logout").then(() => {
                        setIsSignedIn(false);
                        router.reload();
                      });
                    }}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href={oauthURL}
                    className="inline-flex items-center h-10 px-5 m-auto text-sm font-semibold text-blue-500 rounded-lg ring-2 ring-inset ring-blue-500 hover:ring-0 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="border sm:hidden bg-slate-50">
            <div className="pt-2 pb-4 space-y-1">
              <Disclosure.Button
                as="a"
                onClick={() => setShowAboutModal(true)}
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700"
              >
                About
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                onClick={() => setShowPrivacyModal(true)}
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700"
              >
                Privacy
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="https://forms.gle/mcuSkyP5uguV7FKd7"
                target="_blank"
                rel="noreferrer"
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700"
              >
                Report a bug
              </Disclosure.Button>
              {isSignedIn ? (
                <Disclosure.Button
                  as="a"
                  onClick={async () => {
                    await fetch("/api/logout").then(() => {
                      setIsSignedIn(false);
                      router.reload();
                    });
                  }}
                  className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700"
                >
                  Log out
                </Disclosure.Button>
              ) : (
                <Disclosure.Button
                  as="a"
                  href={oauthURL}
                  className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700"
                >
                  Log in
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
