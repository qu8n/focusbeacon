import React from "react";
import PropTypes from "prop-types";
import {
  AboutModalContent,
  privacyModalContent
} from "../constants/textSnippets";

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
      <div className="fixed inset-0 z-50 flex items-center">
        <div className="max-w-3xl mx-auto my-10">
          <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 border-solid rounded-t">
              <h3 className="text-2xl font-semibold capitalize">{modalType}</h3>
              <button
                className="float-right text-2xl font-semibold leading-none bg-transparent opacity-25"
                onClick={handleCloseClick}
              >
                <span className="p-5">x</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-10">
              <div className="text-slate-700 mb-7">
                {modalType === "about" ? (
                  <AboutModalContent />
                ) : (
                  privacyModalContent
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
