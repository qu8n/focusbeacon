/* eslint-disable no-unused-vars */
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import React from "react";
import PropTypes from "prop-types";
import Logo from "./Logo";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

NavBar.propTypes = {
  setShowAboutModal: PropTypes.func.isRequired,
  setShowPrivacyModal: PropTypes.func.isRequired
};

export default function NavBar({ setShowAboutModal, setShowPrivacyModal }) {
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
                <a href="/" className="flex items-center">
                  <Logo />
                </a>
              </div>

              {/* Desktop menu */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  About
                </button>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  Privacy Policy
                </button>
                <a
                  href="https://forms.gle/mcuSkyP5uguV7FKd7"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                >
                  Report a Bug
                </a>
              </div>

              {/* Profile dropdown - TODO: show after sign in */}
              {/* <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="object-cover w-10 h-10 rounded-full"
                        src={data.photoUrl}
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-slate-100" : "",
                              "block px-4 py-2 text-sm text-slate-700"
                            )}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div> */}
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-4 space-y-1">
              <Disclosure.Button
                as="a"
                onClick={() => setShowAboutModal(true)}
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                About
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                onClick={() => setShowPrivacyModal(true)}
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                Privacy Policy
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="https://forms.gle/mcuSkyP5uguV7FKd7"
                target="_blank"
                rel="noreferrer"
                className="block py-2 pl-3 pr-4 text-base font-medium border-l-4 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                Report a Bug
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
