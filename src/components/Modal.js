import React from "react";
import PropTypes from "prop-types";
import {
  AboutModalContent,
  PrivacyModalContent
} from "../constants/textSnippets";
import { XIcon } from "@heroicons/react/solid";

Modal.propTypes = {
  modalType: PropTypes.string.isRequired,
  setShowAboutModal: PropTypes.func.isRequired,
  setShowPrivacyModal: PropTypes.func.isRequired
};

// TODO: Refactor this component to be more generic
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
      <div className="fixed inset-0 z-50 flex items-center">
        <div className="max-w-3xl mx-auto my-10">
          <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between py-5 border-b border-gray-200 border-solid rounded-t">
              <h3 className="ml-10 text-2xl font-semibold capitalize">
                {modalType}
              </h3>
              <button
                type="button"
                className="float-right text-2xl font-semibold leading-none bg-transparent opacity-25 hover:opacity-50"
                onClick={handleCloseClick}
              >
                <XIcon className="mr-5 w-7 h-7" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-10">
              <div className="text-slate-700 mb-7">
                {modalType === "about" ? (
                  <AboutModalContent />
                ) : (
                  <PrivacyModalContent />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outlay */}
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
}
