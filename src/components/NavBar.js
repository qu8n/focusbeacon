import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, ExclamationCircleIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { Badge, Metric, Text } from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

// for styling the dropdown menu options on desktop
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

NavBar.propTypes = {
  data: PropTypes.object.isRequired,
};

export default function NavBar({ data }) {
  const profileData = data;

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              {/* Left side */}
              <div className="flex">
                {/* Mobile menu button */}
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>

                {/* Logo and status badge */}
                <div className="flex flex-shrink-0 items-center">
                  <Metric textAlignment="text-center">
                    <span className="text-gradient-blue">Focus</span>
                  </Metric>
                  <Metric textAlignment="text-center">
                    <span className="text-gradient-orange">Beacon</span>
                  </Metric>
                  <img
                    className="h-8 w-auto -ml-1 mr-2"
                    src="/logo.png"
                    alt="FocusBeacon logo"
                  />
                  <Badge
                    text="pre-alpha"
                    color="yellow"
                    size="sm"
                    icon={ExclamationCircleIcon}
                    tooltip="This dashboard is still in active development. Please report any bugs or feature requests under Issues on the project's GitHub"
                  />
                </div>
              </div>

              {/* Non-mobile profile dropdown */}
              <div className="flex items-center">
                <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <Text>{profileData.name}</Text>
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={profileData.photoUrl}
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="https://github.com/qu8n/FocusBeacon/issues"
                              target="_blank"
                              rel="noopener noreferrer"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Report a Bug
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Sign Out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="border-t border-gray-200 pt-4 pb-3">
              {/* Profile pic and name */}
              <div className="flex items-center px-4 sm:px-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={profileData.photoUrl}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {profileData.name}
                  </div>
                </div>
              </div>

              {/* Mobile menu options */}
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                  Report a Bug
                </Disclosure.Button>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
