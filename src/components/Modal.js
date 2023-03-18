/* eslint-disable react/no-unescaped-entities */
import React from "react";
import PropTypes from "prop-types";

const aboutContent =
  "About: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const privacyContent =
  "Privacy: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

Modal.propTypes = {
  modalType: PropTypes.string.isRequired,
  setShowAboutModal: PropTypes.func.isRequired,
  setShowPrivacyModal: PropTypes.func.isRequired
};

export default function Modal({
  modalType,
  setShowAboutModal,
  setShowPrivacyModal
}) {
  function handleCloseClick() {
    if (modalType === "about") {
      setShowAboutModal(false);
    } else if (modalType === "privacy") {
      setShowPrivacyModal(false);
    }
  }

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="rounded-lg shadow-lg relative flex flex-col w-full bg-white">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
              <h3 className="text-2xl font-semibold capitalize">{modalType}</h3>
              <button
                className="bg-transparent opacity-25 float-right text-2xl leading-none font-semibold"
                onClick={handleCloseClick}
              >
                <span>x</span>
              </button>
            </div>
            {/*body*/}
            <div className="p-10">
              <p className="my-4 text-gray-500 mb-7">
                {modalType === "about" ? aboutContent : privacyContent}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
