import React from "react";
import PropTypes from "prop-types";
import { XIcon } from "@heroicons/react/solid";

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.func.isRequired,
  setOpen: PropTypes.func.isRequired
};

export default function Modal({ title, content, setOpen }) {
  function handleCloseClick() {
    setOpen(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center">
        <div className="max-w-3xl mx-auto my-10">
          <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between py-5 border-b border-gray-200 border-solid rounded-t">
              <h3 className="ml-10 text-2xl font-semibold capitalize">
                {title}
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
              <div className="text-slate-700 mb-7">{content()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Outlay */}
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
}
